
## Gun Marketplace Aggregator



<a name="docker-misc-commands"></a>
### Misc. Docker Commands
To remove old containers and images, try:
```bash
### Remove images
docker rmi <image-id>
docker rm <container-id>
docker prune images
```
```bash
### Stop and remove all containers
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
```

* If there are dangling/detached containers, use `sudo kill $(lsof -t -i:8080)` which will kill the process hogging port 8082 (if it is runnning in the background).

sudo kill $(lsof -t -i:8080)



