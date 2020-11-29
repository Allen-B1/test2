package main

import (
	"github.com/gin-gonic/gin"
	"math/rand"
	"strconv"
	"time"
)

type ID string

func NewID() (ID, string) {
	id := ID(strconv.FormatInt(rand.Int63n(36*36*36*36*36*36*36), 36))
	key := strconv.FormatInt(rand.Int63(), 36)
	key += strconv.FormatInt(rand.Int63(), 36)
	return id, key
}

type Coord [2]int32

type Face struct {
	Position Coord
	Color uint8
}

type Screen struct {
	Owner ID
	Content interface{}
}

type YouTube struct {
	VideoID string		// Video ID
	TimeStart time.Time // Time in which the YouTube video was at 0:00
}

type State struct {
	Faces map[ID]*Face
	Screens map[ID]*Screem
	Keys map[string]ID
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
	r.GET("/objects", func(c *gin.Context) {
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
			}
		}
		c.JSON(200, data)
	})
	r.POST("/create", func (c *gin.Context) {
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

		state.Faces[id] = &Face{
			Position: Coord{int32(rand.Intn(512)),int32(rand.Intn(512))},
			Color: uint8(rand.Intn(4)),
		}
		state.Keys[key] = id
		c.JSON(200, map[string]interface{}{
			"key": key,
			"id": id,
		})
	})

	r.POST("/move", func (c *gin.Context) {
		key := c.Query("key")
		x, _ := strconv.ParseUint(c.Query("x"), 10, 64)
		y, _ := strconv.ParseUint(c.Query("y"), 10, 64)

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
