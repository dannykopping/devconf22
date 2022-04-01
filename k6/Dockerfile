FROM golang:1.17-alpine

RUN apk update && apk add git

RUN go install go.k6.io/xk6/cmd/xk6@v0.6.1
RUN xk6 build --with github.com/szkiba/xk6-faker@latest

ENTRYPOINT [ "./k6" ]