local _require = require
local modules = {}

function register(path, src)
    modules[path] = src
end

function require(o, ...)
    if type(o) == "string" and modules[o] then
        return setfenv(loadstring(modules[o]), setmetatable({}, { __index = getfenv() }))(...)
    end
    return _require(o, ...)
end