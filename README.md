# cc-show

Claude Code 数据文件本地可视化仪表板，TypeScript CLI 工具，主命令 `ccs`。

**默认地址**：`http://localhost:8765`

---

## 安装

```bash
npm install -g @bucle/cc-show@latest
```

---

## 命令

```bash
ccs start                  # 启动 Web 服务（默认端口 8765）
ccs start --port 9000      # 指定端口
ccs stop                   # 停止后台守护进程
ccs stats                  # 终端输出 Token 用量统计
ccs stats --compute        # 重新扫描并刷新统计
ccs config                 # 查看所有配置
ccs config get <key>       # 读取单个配置项
ccs config set <key> <val> # 写入配置项
```