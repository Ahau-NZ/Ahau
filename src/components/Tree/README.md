### Notes

* Changing size of the nodes needs to be changed in four places: 
    1. Node.vue: radius
    2. Link.vue: branch needs to be larger than the radius
    3. Tree.vue: nodeSeparationX
    4. Tree.vue: nodeSeparationY

---

### TODO


 - [ ] Clear addnode form after submission
 - [ ] Allow dates to be cleared as they cant be at the moment
 - [ ] Add Zoom and Pan
 - [ ] Resize tree when window changes
 - [ ] Resize tree when nodes are added or removed


---
### Fix memory leak crash happening when calling `newNode().addChild()`
  
#### Updates

##### Friday 22 November 2019

**8:00am:** Crash seems to happen when adding a node onto a newly added one...

**9:00am:** The crash only happens when getting the data from `$event`in `newNode().addChild()`. Because I added a button and was calling the function from it using local data, and it worked fine.
    
---