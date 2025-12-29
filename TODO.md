- [ ] just like how row and col highlighting can be disabled, we shuold be able to disable target cell highlighting. (this is useful for 1x1 cases)

- [ ] the k.v = kv problem in testProblems revealed a bug. when we have a (1x1).(1x2)=(1x2) problem, the k (a, bottm left quad) matrix has a 2x2 dimension. it should be a single small cell. we need to fix this.

- [ ] we need to add handwriting support for - and ., so users can input negative numbers and floating point numbers on mobile. We may need to augment the mnist training set and the training script with some hyphens and full stops.
