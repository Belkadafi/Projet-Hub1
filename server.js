const http = require("http");
const fs = require("fs");
const path = require("path");
const zsockets = require("zsockets");
const { exec } = require("child_process");
var result = "";

const wss = new zsockets.WebSocketServer(6969, () => {
    console.log("Listening on port 6969");
});

wss.OnInternal("connection", c => {
    c.On("exec_script", obj => {
        console.log("Executing python script");
        str = "python 105torus_2019/105torus.py" + " " +obj;
        exec(str, (err, stdout, stderr) => {
            if (err)
                return console.log(err);
            result = stdout;
            console.log(stderr);
            console.log(result);
            c.Emit("python_result", result);
        });
    });
});

const getType = (extName) => {
    switch (extName) {
        case ".js":
            return "text/javascript";
        case ".css":
            return "text/css";
        case ".html":
            return "text/html";
        case ".png":
            return "image/png";
    }
};

http.createServer(async (req, res) => {
    const fPath = (req.url == '/') ? "index.html" : "." + req.url;
    const extName = path.extname(fPath);
    if (extName == ".ico")
        return;

    const content = fs.readFileSync(fPath, "utf-8");

    res.writeHead(200, {
        "Content-Type": getType(extName)
    });
    res.end(content, "utf-8");
}).listen(80);