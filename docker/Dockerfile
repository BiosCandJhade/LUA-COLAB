FROM alpine:3.20
RUN apk add --no-cache \
    lua5.4 lua5.4-libs lua5.4-dev luarocks \
    gcc g++ make musl-dev \
    openssl-dev zlib-dev yaml-dev \
    pcre-dev \
    libuv-dev \
    gnu-libiconv \
    git bash curl \
    cmake
RUN if [ ! -x /usr/bin/luarocks ]; then \
      ln -s /usr/bin/luarocks-5.4 /usr/bin/luarocks; \
    fi
ENV LD_PRELOAD=/usr/lib/preloadable_libiconv.so
RUN adduser -D -H -s /sbin/nologin sand
RUN luarocks install luasocket && \
    luarocks install luasec && \
    luarocks install lua-cjson && \
    luarocks install lpeg && \
    luarocks install luafilesystem && \
    luarocks install luaposix && \
    luarocks install penlight && \
    luarocks install inspect && \
    luarocks install serpent && \
    luarocks install middleclass && \
    luarocks install 30log && \
    luarocks install busted && \
    luarocks install luassert && \
    luarocks install copas && \
    luarocks install lanes && \
    luarocks install luv && \
    luarocks install luacheck && \
    luarocks install moonscript && \
    luarocks install luautf8 && \
    luarocks install alt-getopt && \
    luarocks install argparse && \
    luarocks install luasystem && \
    luarocks install lua-zlib && \
    luarocks install lua-iconv && \
    luarocks install xml2lua && \
    luarocks install lyaml && \
    luarocks install lrexlib-pcre && \
    luarocks install dkjson && \
    luarocks install bit32 && \
    sh -lc 'echo "return require(\"bit32\")" > /usr/local/share/lua/5.4/bit.lua'
USER sand
WORKDIR /app
COPY . /app
CMD ["lua5.4", "main.lua"]