package main

import (
	"github.com/gin-gonic/gin"
	"math/rand"
	"strconv"
	"time"
	"sync"
)

type ID string

func NewID() (ID, string) {
	id := ID(strconv.FormatInt(rand.Int63n(36*36*36*36*36*36*36), 36))
	key := strconv.FormatInt(rand.Int63(), 36)
	key += strconv.FormatInt(rand.Int63(), 36)
	return id, key
}

type Coord [2]int32

func (c1 Coord) Diff(c2 Coord) int32 {
	dx := c1[0]-c2[0]
	dy := c1[1]-c2[1]
	return dx*dx+dy*dy
}

type Face struct {
	Position Coord
	Color uint8
	Name string
}

const NUM_COLORS = 6

type Screen struct {
	Position Coord
	Owner ID
	Content interface{
		Encode() interface{}
	}
}

type Video struct {
	Type string // "youtube", "twitch_channel", or "twitch_video"
	VideoID string
	TimeStart time.Time
}

func (v *Video) Encode() interface{} {
	return map[string]interface{}{
		"type": v.Type,
		"video_id": v.VideoID,
		"time_start": v.TimeStart,
	}
}

type State struct {
	Faces map[ID]*Face
	Screens map[ID]*Screen
	Keys map[string]ID
	Lock sync.RWMutex
}

func NewState() *State {
	s := &State{}
	s.Faces = make(map[ID]*Face)
	s.Screens = make(map[ID]*Screen)
	s.Keys = make(map[string]ID)
	return s
}

var state = NewState()

func main() {
	rand.Seed(time.Now().UnixNano())

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.File("main.html")
	})
	r.Static("/static", "./static")
	r.GET("/objects", func(c *gin.Context) {
		state.Lock.RLock()
		defer state.Lock.RUnlock()

		key := c.Query("key")
		selfId := state.Keys[key]
		if selfId == "" {
			c.JSON(403, nil)
			return
		}

		data := make(map[ID]interface{})
		for id, face := range state.Faces {
			data[id] = map[string]interface{}{
				"type": "face",
				"position": face.Position,
				"color": face.Color,
				"name": face.Name,
			}
		}

		for id, screen := range state.Screens {
			data[id] = map[string]interface{}{
				"type": "screen",
				"position": screen.Position,
				"content": screen.Content.Encode(),
				"owner": screen.Owner,
			}
		}
		c.JSON(200, data)
	})
	r.POST("/create", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		if c.Query("key") != "" {
			id, ok := state.Keys[c.Query("key")]
			if ok {
				c.JSON(200, map[string]interface{}{
					"key": c.Query("key"),
					"id": id,
				})
				return
			}
		}

		id, key := NewID()

		color := uint8(rand.Intn(NUM_COLORS))
		if len(state.Faces) < NUM_COLORS {
			colorsUsed := make(map[uint8]bool)
			for _, face := range state.Faces {
				colorsUsed[face.Color] = true
			}

			colorsLeft := []uint8{}
			for i := uint8(0); i < NUM_COLORS; i++ {
				if !colorsUsed[i] {
					colorsLeft = append(colorsLeft, i)
				}
			}

			color = colorsLeft[rand.Intn(len(colorsLeft))]
		}

		state.Faces[id] = &Face{
			Position: Coord{int32(rand.Intn(8)),int32(rand.Intn(8))},
			Color: color,
		}
		state.Keys[key] = id
		c.JSON(200, map[string]interface{}{
			"key": key,
			"id": id,
		})
	})

	r.POST("/face/rename", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		face := state.Faces[id]
		face.Name = c.Query("name")

		c.JSON(200, nil)
	})

	r.POST("/face/kill", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		face := state.Faces[id]

		killed := []ID{}
		for targetID, target := range state.Faces {
			if target.Position.Diff(face.Position) == 1 {
				delete(state.Faces, targetID)
				killed = append(killed, targetID)
			}
		}

		c.JSON(200, killed)
	})

	r.POST("/screen/create", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		screenID, _ := NewID()
		screen := new(Screen)
		screen.Owner = id
		screen.Position = state.Faces[id].Position
		screen.Position[0] += 1
		state.Screens[screenID] = screen
		c.JSON(200, screenID)
	})

	r.POST("/screen/delete", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		screenID := ID(c.Query("screen"))
		screen, ok := state.Screens[screenID]
		if !ok {
			c.JSON(400, map[string]string{"error": "invalid screen id"})
			return
		}
		if id != screen.Owner {
			c.JSON(400, map[string]string{"error": "not owner of screen"})
			return
		}
	
		delete(state.Screens, screenID)

		c.JSON(200, nil)
	})

	r.POST("/screen/close", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		screenID := ID(c.Query("screen"))
		screen, ok := state.Screens[screenID]
		if !ok {
			c.JSON(400, map[string]string{"error": "invalid screen id"})
			return
		}
		if id != screen.Owner {
			c.JSON(400, map[string]string{"error": "not owner of screen"})
			return
		}
	
		screen.Content = nil

		c.JSON(200, nil)
	})

	r.POST("/screen/video", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		id := state.Keys[c.Query("key")]
		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		screenID := ID(c.Query("screen"))
		screen, ok := state.Screens[screenID]
		if !ok {
			c.JSON(400, map[string]string{"error": "invalid screen id"})
			return
		}
		if id != screen.Owner {
			c.JSON(400, map[string]string{"error": "not owner of screen"})
			return
		}
		
		timeOffset, err := time.ParseDuration(c.Query("time_offset"))
		if err != nil {
			timeOffset = 0
		}
		contentID := c.Query("content_id")
		screen.Content = Video{
			Type: c.Query("type"),
			ContentID: contentID,
			TimeStart: time.Now().Add(-timeOffset),
		}

		c.JSON(200, nil)
	})

	r.POST("/move", func (c *gin.Context) {
		state.Lock.Lock()
		defer state.Lock.Unlock()

		key := c.Query("key")
		x, _ := strconv.ParseInt(c.Query("x"), 10, 32)
		y, _ := strconv.ParseInt(c.Query("y"), 10, 32)

		id := state.Keys[key]

		if _, ok := state.Faces[id]; !ok {
			c.JSON(400, map[string]string{"error": "invalid id"})
			return
		}

		state.Faces[id].Position = Coord{int32(x),int32(y)}

		c.JSON(200, nil)
	})
	r.Run()
}
