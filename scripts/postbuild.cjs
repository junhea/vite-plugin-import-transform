const fs = require("fs")
fs.copyFileSync("./src/types.d.ts", "./dist/types.d.ts")
fs.copyFileSync("./README.md", "./dist/README.md")
fs.copyFileSync("./LICENSE", "./dist/LICENSE")

const packageJson = JSON.parse(fs.readFileSync("./package.json"))
packageJson.private = false
packageJson.scripts = undefined
packageJson.prettier = undefined

fs.writeFileSync(
  "./dist/package.json",
  JSON.stringify(packageJson, undefined, 2),
)
