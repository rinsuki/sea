workflow "Build Containers" {
  on = "push"
  resolves = ["Build"]
}

action "Build" {
  uses = "actions/docker/cli@86ff551d26008267bb89ac11198ba7f1d807b699"
  runs = "build"
}
