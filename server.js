const express = require('express')
const path = require('path')
const {promisify} = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)
//解析fsc的编译器
const compilerSFC = require('@vue/compiler-sfc')
const compilerDOM = require('@vue/compiler-dom')

const {query} = require("express");
const app = express()

const rewriteImport = (content) => {
    return content.replace(/from ['"](.*)['"]/g, (s1, s2) => {
        if (s2.startsWith("./") || s2.startsWith("/") || s2.startsWith("../")) {
            return s1
        } else {
            //裸模块替换成/@module/*
            return ` from '/@modules/${s2}'`
        }
    })
}

app.use(async (req, res, next) => {
    if (req.path === '/') {
        const html = await readFile(path.join(__dirname, "/index.html"))
        res.setHeader("Content-Type", "text/html")
        res.status(200).end(html)
    } else if (req.path.endsWith(".js")) {
        const filePath = path.join(__dirname, req.path)
        const content = rewriteImport(await readFile(filePath, "utf8"))
        res.setHeader("Content-Type", "application/javascript")
        res.status(200).end(content)
    } else if (req.path.startsWith('/@modules/')) {
        const moduleName = req.path.replace("/@modules/", '')
        const modulePackage = path.join(__dirname, "/node_modules", moduleName)
        const packageFile = await readFile(path.join(modulePackage, "package.json"))
        const modulePath = path.join(modulePackage, JSON.parse(packageFile.toString()).module)
        const moduleFile = await readFile(modulePath, "utf8")
        const resContent = rewriteImport(moduleFile)
        res.setHeader("Content-Type", "application/javascript")
        res.status(200).end(resContent)
    } else if (req.path.indexOf(".vue") > -1) {
        const filePath = path.join(__dirname, req.path.split('?')[0])
        const result = compilerSFC.parse(await readFile(filePath, "utf8"))
        if (!req.query.type) {
            //SFC请求
            //读取vue文件
            //获取脚本部分的内容
            console.log(resultre)
            const scriptContent = rewriteImport(result.descriptor.script.content)
            const script = scriptContent.replace('export default', 'const _script=')
            res.setHeader("Content-Type", "application/javascript")
            res.status(200).end(`
         ${script}
         //解析template
         import {render as _render} from '${req.path}?type=template'
         _script.render=_render
         export default _script
        `)
        } else if (req.query.type === "template") {
            const html = result.descriptor.template.content
            //编译html
            const render = compilerDOM.compile(html, {mode: "module"}).code
            res.setHeader("Content-Type", "application/javascript")
            res.status(200).end(rewriteImport(render))
        }


    }
    next()
})


app.listen(8888, () => {
    console.log("成功监听端口")
})
