local code_path = "/work/code.lua"
local instr_limit = tonumber(os.getenv("INSTR_LIMIT") or "800000")
local safe_env = {}
setmetatable(safe_env, {__index = _G})
safe_env._G = safe_env
local chunk, load_err = loadfile(code_path, "t", safe_env)
if not chunk then
    io.write((load_err or "error: no se pudo cargar el script") .. "\n")
    os.exit(1)
end
local debug = debug
if debug and instr_limit and instr_limit > 0 then
    local count = 0
    debug.sethook(function()
        count = count + 1
        if count > instr_limit then
            error("Time limit exceeded (instruction budget)")
        end
    end, "", 1000)
end
local ok, run_err = pcall(chunk)
if debug then debug.sethook() end
if not ok then
    io.write((tostring(run_err) or "error durante la ejecución") .. "\n")
    os.exit(1)
end
