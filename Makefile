IMAGE=bunchballdev/keymaster
GIT_HASH=$(shell git rev-parse --short HEAD)

default: tag

clean:
	echo "clean"

prep:
	docker pull bunchballdev/node:5

install: clean
	docker run -it --rm --name install -v `pwd`:/usr/src/app -w /usr/src/app node:5 npm install

build_image: install
	docker build --no-cache -t $(IMAGE):$(GIT_HASH) .

test: build_image
	# docker run -it --rm ${IMAGE}:${GIT_HASH}

tag: build_image test
	docker tag -f $(IMAGE):${GIT_HASH} $(IMAGE):latest

push: tag test
	docker push $(IMAGE):$(GIT_HASH)
	docker push $(IMAGE):latest

run: 
	#docker run -it -p 3000:3000 -v `pwd`:/usr/src/app --rm -w /usr/src/app ${IMAGE}:${GIT_HASH} node_modules/nodemon/bin/nodemon.js -L --ignore node_modules/ --ignore public/ --ignore .tmp/ index.js
	docker-compose down
	docker-compose up