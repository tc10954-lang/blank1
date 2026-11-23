(function() {
    let e = document.createElement(`link`).relList;
    if (e && e.supports && e.supports(`modulepreload`))
        return;
    for (let e of document.querySelectorAll(`link[rel="modulepreload"]`))
        n(e);
    new MutationObserver(e => {
        for (let t of e)
            if (t.type === `childList`)
                for (let e of t.addedNodes)
                    e.tagName === `LINK` && e.rel === `modulepreload` && n(e)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function t(e) {
        let t = {};
        return e.integrity && (t.integrity = e.integrity),
        e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
        t.credentials = e.crossOrigin === `use-credentials` ? `include` : e.crossOrigin === `anonymous` ? `omit` : `same-origin`,
        t
    }
    function n(e) {
        if (e.ep)
            return;
        e.ep = !0;
        let n = t(e);
        fetch(e.href, n)
    }
}
)();
var e = new TextDecoder(`utf-8`)
  , t = new TextDecoder(`ascii`)
  , n = class {
    bytes;
    view;
    constructor(e) {
        this.bytes = e,
        this.view = new DataView(e.buffer,e.byteOffset,e.byteLength)
    }
    u8(e) {
        return this.view.getUint8(e)
    }
    u16(e) {
        return this.view.getUint16(e, !0)
    }
    i16(e) {
        return this.view.getInt16(e, !0)
    }
    u32(e) {
        return this.view.getUint32(e, !0)
    }
    i32(e) {
        return this.view.getInt32(e, !0)
    }
    f32(e) {
        return this.view.getFloat32(e, !0)
    }
    tag(e) {
        return t.decode(this.bytes.subarray(e, e + 4))
    }
    string(t) {
        if (t === 0)
            return ``;
        let n = this.u32(t - 4);
        return e.decode(this.bytes.subarray(t, t + n))
    }
    pointerList(e) {
        let t = this.u32(e)
          , n = Array(t);
        for (let r = 0; r < t; r++)
            n[r] = this.u32(e + 4 + 4 * r);
        return n
    }
}
  , r = 16;
function i(e) {
    let t = new n(e);
    if (t.tag(0) !== `FORM`)
        throw Error(`data.win: missing FORM header`);
    let i = o(t)
      , l = a(i, `GEN8`)
      , _ = t.u8(l.offset + 1);
    if (_ > r)
        throw Error(`data.win: bytecode ${_} is newer than this engine supports`);
    let v = new Map
      , y = e => {
        let n = v.get(e);
        return n || (n = s(t, e),
        v.set(e, n)),
        n
    }
      , re = u(t, a(i, `SPRT`), y)
      , ie = d(t, a(i, `FONT`), y)
      , ae = m(t, a(i, `ROOM`))
      , oe = t.pointerList(a(i, `SCPT`).offset).map(e => [t.string(t.u32(e)), t.u32(e + 4)]);
    return {
        bytecodeVersion: _,
        displayName: t.string(t.u32(l.offset + 40)),
        windowWidth: t.u32(l.offset + 60),
        windowHeight: t.u32(l.offset + 64),
        chunks: i,
        bytes: e,
        reader: t,
        texturePages: c(t, a(i, `TXTR`)),
        sprites: new Map(re.map(e => [e.name, e])),
        spriteList: re,
        fonts: new Map(ie.map(e => [e.name, e])),
        fontList: ie,
        backgrounds: t.pointerList(a(i, `BGND`).offset).map( (e, n) => {
            let r = t.u32(e + 16);
            return {
                index: n,
                name: t.string(t.u32(e)),
                item: r ? y(r) : null
            }
        }
        ),
        sounds: f(t, a(i, `SOND`)),
        audio: t.pointerList(a(i, `AUDO`).offset).map(e => t.bytes.subarray(e + 4, e + 4 + t.u32(e))),
        objects: p(t, a(i, `OBJT`)),
        rooms: ae,
        roomNames: ae.map(e => e.name),
        roomOrder: h(t, l, ae.length),
        paths: g(t, a(i, `PATH`)),
        scripts: new Map(oe),
        scriptNames: oe.map( ([e]) => e),
        code: ee(t, a(i, `CODE`)),
        strings: t.pointerList(a(i, `STRG`).offset).map(e => t.string(e + 4)),
        variableRefs: te(t, a(i, `VARI`)),
        functionRefs: ne(t, a(i, `FUNC`))
    }
}
function a(e, t) {
    let n = e.get(t);
    if (!n)
        throw Error(`data.win: missing ${t} chunk`);
    return n
}
function o(e) {
    let t = new Map
      , n = 8 + e.u32(4);
    for (let r = 8; r < n; ) {
        let n = e.u32(r + 4);
        t.set(e.tag(r), {
            offset: r + 8,
            size: n
        }),
        r += 8 + n
    }
    return t
}
function s(e, t) {
    return {
        sourceX: e.u16(t),
        sourceY: e.u16(t + 2),
        sourceWidth: e.u16(t + 4),
        sourceHeight: e.u16(t + 6),
        targetX: e.u16(t + 8),
        targetY: e.u16(t + 10),
        targetWidth: e.u16(t + 12),
        targetHeight: e.u16(t + 14),
        boundingWidth: e.u16(t + 16),
        boundingHeight: e.u16(t + 18),
        page: e.u16(t + 20)
    }
}
function c(e, t) {
    return e.pointerList(t.offset).map(t => {
        let n = e.u32(t + 4);
        return e.bytes.subarray(n, n + l(e, n))
    }
    )
}
function l(e, t) {
    let n = t + 8;
    for (; n + 12 <= e.bytes.length; ) {
        let r = e.view.getUint32(n, !1)
          , i = e.tag(n + 4);
        if (n += 12 + r,
        i === `IEND`)
            return n - t
    }
    throw Error(`data.win: unterminated PNG at ${t}`)
}
function u(e, t, n) {
    return e.pointerList(t.offset).map( (t, r) => {
        let i = e.i32(t + 4)
          , a = e.i32(t + 8)
          , o = e.i32(t + 56) === -1
          , s = o ? [] : e.pointerList(t + 56)
          , c = [];
        if (!o) {
            let n = t + 60 + 4 * s.length
              , r = e.u32(n);
            n += 4;
            let o = (i + 7 >> 3) * a;
            for (let t = 0; t < r; t++,
            n += o)
                c.push(e.bytes.subarray(n, n + o))
        }
        return {
            index: r,
            name: e.string(e.u32(t)),
            width: i,
            height: a,
            bboxLeft: e.i32(t + 12),
            bboxRight: e.i32(t + 16),
            bboxBottom: e.i32(t + 20),
            bboxTop: e.i32(t + 24),
            bboxMode: e.u32(t + 40),
            collisionKind: e.u32(t + 44),
            originX: e.i32(t + 48),
            originY: e.i32(t + 52),
            frames: s.map(n),
            masks: c
        }
    }
    )
}
function d(e, t, n) {
    return e.pointerList(t.offset).map( (t, r) => {
        let i = new Map
          , a = 0;
        for (let n of e.pointerList(t + 40)) {
            let t = {
                char: e.u16(n),
                x: e.u16(n + 2),
                y: e.u16(n + 4),
                width: e.u16(n + 6),
                height: e.u16(n + 8),
                shift: e.i16(n + 10),
                offset: e.i16(n + 12)
            };
            i.set(t.char, t),
            a = Math.max(a, t.height)
        }
        return {
            index: r,
            name: e.string(e.u32(t)),
            displayName: e.string(e.u32(t + 4)),
            size: e.u32(t + 8),
            bold: e.u32(t + 12) !== 0,
            italic: e.u32(t + 16) !== 0,
            item: n(e.u32(t + 28)),
            scaleX: e.f32(t + 32),
            scaleY: e.f32(t + 36),
            glyphs: i,
            lineHeight: a
        }
    }
    )
}
function f(e, t) {
    return e.pointerList(t.offset).map( (t, n) => {
        let r = !!(e.u32(t + 4) & 3);
        return {
            index: n,
            name: e.string(e.u32(t)),
            file: e.string(e.u32(t + 12)),
            volume: e.f32(t + 20),
            pitch: e.f32(t + 24),
            audioId: r ? e.i32(t + 32) : -1
        }
    }
    )
}
function p(e, t) {
    return e.pointerList(t.offset).map( (t, n) => {
        let r = e.i32(t + 64)
          , i = t + 80 + 8 * Math.max(0, r)
          , a = new Map;
        return e.pointerList(i).forEach( (t, n) => {
            let r = new Map;
            for (let n of e.pointerList(t)) {
                let t = e.u32(n)
                  , i = e.pointerList(n + 4);
                for (let n of i) {
                    let i = e.i32(n + 32);
                    i >= 0 && r.set(t, i)
                }
            }
            r.size && a.set(n, r)
        }
        ),
        {
            index: n,
            name: e.string(e.u32(t)),
            sprite: e.i32(t + 4),
            visible: e.u32(t + 8) !== 0,
            solid: e.u32(t + 12) !== 0,
            depth: e.i32(t + 16),
            persistent: e.u32(t + 20) !== 0,
            parent: e.i32(t + 24),
            mask: e.i32(t + 28),
            events: a
        }
    }
    )
}
function m(e, t) {
    return e.pointerList(t.offset).map( (t, n) => ({
        index: n,
        name: e.string(e.u32(t)),
        width: e.u32(t + 8),
        height: e.u32(t + 12),
        speed: e.u32(t + 16),
        persistent: e.u32(t + 20) !== 0,
        backgroundColor: e.u32(t + 24),
        drawBackgroundColor: e.u32(t + 28) !== 0,
        creationCode: e.i32(t + 32),
        flags: e.u32(t + 36),
        backgrounds: e.pointerList(e.u32(t + 40)).map(t => ({
            enabled: e.u32(t) !== 0,
            foreground: e.u32(t + 4) !== 0,
            background: e.i32(t + 8),
            x: e.i32(t + 12),
            y: e.i32(t + 16),
            tileX: e.u32(t + 20) !== 0,
            tileY: e.u32(t + 24) !== 0,
            speedX: e.i32(t + 28),
            speedY: e.i32(t + 32),
            stretch: e.u32(t + 36) !== 0
        })),
        views: e.pointerList(e.u32(t + 44)).map(t => ({
            enabled: e.u32(t) !== 0,
            viewX: e.i32(t + 4),
            viewY: e.i32(t + 8),
            viewW: e.i32(t + 12),
            viewH: e.i32(t + 16),
            portX: e.i32(t + 20),
            portY: e.i32(t + 24),
            portW: e.i32(t + 28),
            portH: e.i32(t + 32),
            borderX: e.u32(t + 36),
            borderY: e.u32(t + 40),
            speedX: e.i32(t + 44),
            speedY: e.i32(t + 48),
            object: e.i32(t + 52)
        })),
        instances: e.pointerList(e.u32(t + 48)).map(t => ({
            x: e.i32(t),
            y: e.i32(t + 4),
            object: e.i32(t + 8),
            id: e.u32(t + 12),
            creationCode: e.i32(t + 16),
            scaleX: e.f32(t + 20),
            scaleY: e.f32(t + 24),
            color: e.u32(t + 28),
            rotation: e.f32(t + 32),
            preCreateCode: e.i32(t + 36)
        })),
        tiles: e.pointerList(e.u32(t + 52)).map(t => ({
            x: e.i32(t),
            y: e.i32(t + 4),
            background: e.i32(t + 8),
            sourceX: e.u32(t + 12),
            sourceY: e.u32(t + 16),
            width: e.u32(t + 20),
            height: e.u32(t + 24),
            depth: e.i32(t + 28),
            id: e.u32(t + 32),
            scaleX: e.f32(t + 36),
            scaleY: e.f32(t + 40),
            color: e.u32(t + 44)
        }))
    }))
}
function h(e, t, n) {
    for (let r = t.offset + t.size - 4; r >= t.offset; r -= 4) {
        let i = e.u32(r);
        if (i > 0 && i <= n && r + 4 + 4 * i === t.offset + t.size)
            return Array.from({
                length: i
            }, (t, n) => e.u32(r + 4 + 4 * n))
    }
    throw Error(`data.win: room order not found`)
}
function g(e, t) {
    return e.pointerList(t.offset).map( (t, n) => {
        let r = e.u32(t + 16);
        return {
            index: n,
            name: e.string(e.u32(t)),
            smooth: e.u32(t + 4) !== 0,
            closed: e.u32(t + 8) !== 0,
            precision: e.u32(t + 12),
            points: Array.from({
                length: r
            }, (n, r) => ({
                x: e.f32(t + 20 + 12 * r),
                y: e.f32(t + 24 + 12 * r),
                speed: e.f32(t + 28 + 12 * r)
            }))
        }
    }
    )
}
function ee(e, t) {
    return e.pointerList(t.offset).map( (t, n) => {
        let r = e.i32(t + 12);
        return {
            index: n,
            name: e.string(e.u32(t)),
            length: e.u32(t + 4),
            locals: e.u16(t + 8),
            arguments: e.u16(t + 10) & 32767,
            start: t + 12 + r + e.u32(t + 16)
        }
    }
    )
}
function te(e, t) {
    let n = new Map
      , r = Math.floor((t.size - 12) / 20);
    for (let i = 0; i < r; i++) {
        let r = t.offset + 12 + 20 * i
          , a = {
            name: e.string(e.u32(r)),
            instanceType: e.i32(r + 4),
            varId: e.i32(r + 8)
        }
          , o = e.i32(r + 16);
        for (let t = e.u32(r + 12); t > 0; t--)
            n.set(o, a),
            o += e.u32(o + 4) & 134217727
    }
    return n
}
function ne(e, t) {
    let n = new Map
      , r = e.u32(t.offset);
    for (let i = 0; i < r; i++) {
        let r = t.offset + 4 + 12 * i
          , a = e.string(e.u32(r))
          , o = e.i32(r + 8);
        for (let t = e.u32(r + 4); t > 0; t--)
            n.set(o, a),
            o += e.u32(o + 4) & 134217727
    }
    return n
}
var _ = [`config.ini`, `file0`, `file8`, `file9`, `undertale.ini`, `system_information_962`, `system_information_963`]
  , v = 4096
  , y = 512
  , re = /^\[[A-Za-z0-9_ ]{1,64}\]$/
  , ie = /^[A-Za-z0-9_ ]{1,64}="[^"]{0,256}"$/
  , ae = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‪-‮⁦-⁩]/
  , oe = new TextDecoder(`utf-8`,{
    fatal: !0
});
function se(e) {
    return _.includes(e)
}
function ce(e, t) {
    if (t.length > 65536)
        return `too large`;
    let n;
    try {
        n = oe.decode(t)
    } catch {
        return `not UTF-8 text`
    }
    if (ae.test(n))
        return `contains control characters`;
    let r = n.split(/\r?\n/);
    if (r.length > v)
        return `too many lines`;
    let i = e.endsWith(`.ini`);
    for (let e of r) {
        if (e.length > y)
            return `line too long`;
        if (i && e !== `` && !re.test(e) && !ie.test(e))
            return `not in INI format`
    }
    return null
}
var le = `undertale-web-save.json`
  , ue = `.txt`
  , de = `undertale-web-save`
  , fe = 1
  , pe = 4096
  , me = _.length + 1
  , he = /^[0-9a-f]{64}$/
  , ge = /^[A-Za-z0-9+/]{43}=$/
  , _e = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  , ve = `That folder is not a save exported by this game.
Pick the folder that Export created.`
  , ye = `That save was changed after it was exported,
or was exported from another browser. It was not loaded.`
  , b = class extends Error {
}
;
async function be() {
    return crypto.subtle.generateKey({
        name: `HMAC`,
        hash: `SHA-256`
    }, !1, [`sign`, `verify`])
}
function xe(e) {
    return e instanceof CryptoKey && e.algorithm.name === `HMAC` && !e.extractable && e.usages.includes(`sign`) && e.usages.includes(`verify`)
}
async function Se(e, t) {
    let n = [];
    for (let t of [...e.keys()].sort()) {
        let r = e.get(t);
        n.push({
            name: t,
            size: r.length,
            sha256: await ke(r)
        })
    }
    let r = {
        format: de,
        version: fe,
        created: new Date().toISOString(),
        files: n
    }
      , i = await crypto.subtle.sign(`HMAC`, t, Te(r))
      , a = {
        ...r,
        signature: Ae(new Uint8Array(i))
    }
      , o = new Map(e);
    return o.set(le, new TextEncoder().encode(`${JSON.stringify(a, null, `	`)}\n`)),
    o
}
async function Ce(e, t) {
    if (e.length === 0 || e.length > me)
        throw new b(ve);
    let n = new Map;
    for (let t of e) {
        let e = t.webkitRelativePath ? t.webkitRelativePath.split(`/`).length : 2
          , r = we(t.name);
        if (e !== 2 || r === null || n.has(r))
            throw new b(ve);
        n.set(r, t)
    }
    let r = n.get(le);
    if (!r || r.size > pe)
        throw new b(ve);
    let i = Ee(await r.arrayBuffer());
    if (!i)
        throw new b(ve);
    let a = je(i.signature);
    if (!await crypto.subtle.verify(`HMAC`, t, a, Te(i)) || n.size !== i.files.length + 1)
        throw new b(ye);
    let o = new Map;
    for (let e of i.files) {
        let t = n.get(e.name);
        if (!t || t.size !== e.size)
            throw new b(ye);
        let r = new Uint8Array(await t.arrayBuffer());
        if (r.length !== e.size || await ke(r) !== e.sha256 || ce(e.name, r))
            throw new b(ye);
        o.set(e.name, r)
    }
    if (!o.has(`file0`))
        throw new b(`That export has no saved progress in it.`);
    return o
}
function we(e) {
    let t = e.endsWith(`.txt`) ? e.slice(0, -4) : e;
    return t === `undertale-web-save.json` || se(t) ? t : null
}
function Te(e) {
    let t = e.files.map(e => [e.name, e.size, e.sha256]);
    return new TextEncoder().encode(JSON.stringify([e.format, e.version, e.created, t]))
}
function Ee(e) {
    let t;
    try {
        t = JSON.parse(new TextDecoder(`utf-8`,{
            fatal: !0
        }).decode(e))
    } catch {
        return null
    }
    if (!De(t) || !Oe(t, [`format`, `version`, `created`, `files`, `signature`]))
        return null;
    let {format: n, version: r, created: i, files: a, signature: o} = t;
    if (n !== de || r !== fe || typeof i != `string` || !_e.test(i) || typeof o != `string` || !ge.test(o) || !Array.isArray(a) || a.length === 0 || a.length > _.length)
        return null;
    let s = [];
    for (let e of a) {
        if (!De(e) || !Oe(e, [`name`, `size`, `sha256`]))
            return null;
        let {name: t, size: n, sha256: r} = e;
        if (typeof t != `string` || !se(t) || s.some(e => e.name === t) || typeof n != `number` || !Number.isSafeInteger(n) || n < 0 || n > 65536 || typeof r != `string` || !he.test(r))
            return null;
        s.push({
            name: t,
            size: n,
            sha256: r
        })
    }
    return {
        format: n,
        version: r,
        created: i,
        files: s,
        signature: o
    }
}
function De(e) {
    return typeof e == `object` && !!e && Object.getPrototypeOf(e) === Object.prototype
}
function Oe(e, t) {
    return Object.keys(e).length === t.length && t.every(t => Object.hasOwn(e, t))
}
async function ke(e) {
    let t = new Uint8Array(await crypto.subtle.digest(`SHA-256`, e.slice()));
    return Array.from(t, e => e.toString(16).padStart(2, `0`)).join(``)
}
function Ae(e) {
    return btoa(String.fromCharCode(...e))
}
function je(e) {
    return Uint8Array.from(atob(e), e => e.charCodeAt(0))
}
async function Me(e) {
    let t = `undertale-save-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, `-`)}`
      , n = window.showDirectoryPicker;
    if (n) {
        let r = await n({
            id: `undertale-export`,
            mode: `readwrite`
        });
        if (await Ne(r, t))
            throw Error(`A folder named ${t} already exists there.`);
        let i = t;
        try {
            let n = await r.getDirectoryHandle(t, {
                create: !0
            });
            for (let[t,r] of e) {
                i = t;
                let e = await (await n.getFileHandle(t, {
                    create: !0
                }).catch(e => {
                    if (!(e instanceof TypeError))
                        throw e;
                    return i = t + ue,
                    n.getFileHandle(i, {
                        create: !0
                    })
                }
                )).createWritable();
                await e.write(r.slice()),
                await e.close()
            }
            return `Saved to the folder ${t}. Import that folder to load it.`
        } catch (e) {
            console.warn(`Folder write refused at "${i}", downloading the files instead:`, e),
            await r.removeEntry(t, {
                recursive: !0
            }).catch( () => void 0)
        }
    }
    for (let[t,n] of e) {
        let e = URL.createObjectURL(new Blob([n.slice()],{
            type: `application/octet-stream`
        }))
          , r = document.createElement(`a`);
        r.href = e,
        r.download = t,
        r.click(),
        setTimeout( () => URL.revokeObjectURL(e), 1e4)
    }
    return `Downloaded ${e.size} files. Put them together in one new folder, then import that folder.`
}
async function Ne(e, t) {
    try {
        return await e.getDirectoryHandle(t),
        !0
    } catch {
        return !1
    }
}
function Pe() {
    let e = [{
        toggle: `#help-open`,
        panel: `#help-panel`,
        close: `#help-close`,
        title: `#help-title`
    }, {
        toggle: `#keys-open`,
        panel: `#keys-panel`,
        close: `#keys-close`,
        title: `#keys-title`
    }].map(e => ({
        toggle: document.querySelector(e.toggle),
        panel: document.querySelector(e.panel),
        close: document.querySelector(e.close),
        title: document.querySelector(e.title)
    }))
      , t = document.querySelector(`#help-toggle`)
      , n = () => t.focus()
      , r = t => {
        for (let n of e) {
            let e = n === t;
            n.panel.hidden = !e,
            n.toggle.setAttribute(`aria-expanded`, String(e))
        }
        t?.title.focus()
    }
    ;
    for (let t of e)
        t.toggle.addEventListener(`click`, () => r(t.panel.hidden ? t : null)),
        t.close.addEventListener(`click`, () => {
            r(null),
            n()
        }
        );
    addEventListener(`keydown`, t => {
        let i = e.find(e => !e.panel.hidden);
        t.key === `Escape` && i && (r(null),
        n())
    }
    )
}
function Fe() {
    let e = [{
        toggle: `#help-toggle`,
        popover: `#help-popover`
    }, {
        toggle: `#audio-toggle`,
        popover: `#audio-popover`
    }].map(e => ({
        toggle: document.querySelector(e.toggle),
        popover: document.querySelector(e.popover)
    }))
      , t = document.querySelector(`#toolbar`)
      , n = t => {
        for (let n of e) {
            let e = n === t;
            n.popover.hidden = !e,
            n.toggle.setAttribute(`aria-expanded`, String(e))
        }
        t?.popover.querySelector(`button:not(:disabled), input`)?.focus()
    }
      , r = () => e.find(e => !e.popover.hidden)
      , i = e => {
        let i = r();
        n(null),
        e ? i?.toggle.focus() : t.contains(document.activeElement) && document.activeElement.blur()
    }
    ;
    for (let t of e)
        t.toggle.addEventListener(`click`, e => {
            if (!t.popover.hidden)
                return i(e.detail === 0);
            n(t),
            e.detail !== 0 && document.activeElement?.blur()
        }
        );
    for (let e of t.querySelectorAll(`.menu button`))
        e.addEventListener(`click`, () => n(null));
    addEventListener(`pointerdown`, e => {
        r() && !e.target.closest(`.popover-anchor`) && i(!1)
    }
    );
    for (let e of [`keydown`, `keyup`])
        t.addEventListener(e, t => {
            let n = t.target
              , r = !!n.closest(`.popover:not([hidden])`)
              , a = !!n.closest(`.round`) && (t.key === `Enter` || t.key === ` `);
            (r || a) && (e === `keydown` && t.key === `Escape` && i(!0),
            t.stopPropagation())
        }
        )
}
var Ie = new Set([`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, ` `, `Enter`, `z`, `x`, `c`])
  , Le = {
    w: `ArrowUp`,
    a: `ArrowLeft`,
    s: `ArrowDown`,
    d: `ArrowRight`
};
function Re(e) {
    let t = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    return Le[t] ?? t
}
var ze = class {
    down = new Set;
    pressedThisFrame = new Set;
    constructor(e) {
        e.addEventListener(`keydown`, e => {
            let t = Re(e);
            Ie.has(t) && e.preventDefault(),
            e.repeat || this.pressedThisFrame.add(t),
            this.down.add(t)
        }
        ),
        e.addEventListener(`keyup`, e => this.down.delete(Re(e))),
        e.addEventListener(`blur`, () => this.down.clear())
    }
    isDown(...e) {
        return e.some(e => this.down.has(e))
    }
    pressed(...e) {
        return e.some(e => this.pressedThisFrame.has(e))
    }
    endFrame() {
        this.pressedThisFrame = new Set
    }
}
  , Be = class {
    x = -1;
    y = -1;
    moved = !1;
    clicked = !1;
    canvas;
    constructor(e) {
        this.canvas = e,
        e.addEventListener(`pointermove`, e => {
            this.locate(e),
            this.moved = !0
        }
        ),
        e.addEventListener(`pointerdown`, e => {
            e.button === 0 && (this.locate(e),
            this.clicked = !0)
        }
        ),
        e.addEventListener(`pointerleave`, () => {
            this.x = this.y = -1
        }
        )
    }
    endFrame() {
        this.moved = this.clicked = !1
    }
    locate(e) {
        let t = this.canvas.getBoundingClientRect();
        this.x = (e.clientX - t.left) * this.canvas.width / t.width,
        this.y = (e.clientY - t.top) * this.canvas.height / t.height
    }
}
  , Ve = new Map([[`[Z or ENTER]`, `[Z or SPACE]`], [`[PRESS Z OR ENTER]`, `[PRESS Z OR SPACE]`], [`[Z / ENTER]`, `[Z / SPACE]`], [`When HP is 0, you lose.`, `[Hold ENTER] - Skip scene`]]);
function He(e) {
    e.strings.forEach( (t, n) => {
        let r = Ve.get(t);
        r !== void 0 && (e.strings[n] = r)
    }
    )
}
var x = 16777215
  , Ue = 65535
  , We = 8421504;
function Ge(e, t, n, r, i, a=x, o=1) {
    let s = t.frames[n % t.frames.length];
    e.drawRegion(s.page, s.sourceX, s.sourceY, s.sourceWidth, s.sourceHeight, r - t.originX + s.targetX, i - t.originY + s.targetY, s.targetWidth, s.targetHeight, a, o)
}
function Ke(e, t, n=1) {
    let r = 0;
    for (let n of t)
        r += Je(e, n.codePointAt(0) ?? 0);
    return r * e.scaleX * n
}
function qe(e, t, n, r, i, a={}) {
    let {color: o=x, alpha: s=1, scale: c=1, align: l=`left`} = a
      , u = t.scaleX * c
      , d = t.scaleY * c
      , {item: f} = t;
    n.split(`
`).forEach( (n, a) => {
        let p = Ke(t, n, c)
          , m = l === `center` ? r - p / 2 : l === `right` ? r - p : r
          , h = i + a * t.lineHeight * d;
        for (let r of n) {
            let n = r.codePointAt(0) ?? 0
              , i = t.glyphs.get(n);
            i && i.width > 0 && e.drawRegion(f.page, f.sourceX + i.x, f.sourceY + i.y, i.width, i.height, Math.round(m + i.offset * u), Math.round(h), i.width * u, i.height * d, o, s),
            m += Je(t, n) * u
        }
    }
    )
}
function Je(e, t) {
    return e.glyphs.get(t)?.shift ?? Math.ceil(e.size / 2)
}
var Ye = `#version 300 es
in vec2 aPos;
in vec2 aUv;
in vec4 aColor;
uniform vec2 uView;
out vec2 vUv;
out vec4 vColor;
void main() {
	vUv = aUv;
	vColor = aColor;
	gl_Position = vec4(aPos.x / uView.x * 2.0 - 1.0, 1.0 - aPos.y / uView.y * 2.0, 0.0, 1.0);
}`
  , Xe = `#version 300 es
precision mediump float;
in vec2 vUv;
in vec4 vColor;
uniform sampler2D uTex;
out vec4 outColor;
void main() {
	outColor = texture(uTex, vUv) * vColor;
}`
  , Ze = 8
  , Qe = 4096
  , $e = {
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0
}
  , et = class {
    width;
    height;
    white;
    canvas;
    gl;
    pngs;
    pages = [];
    loading = new Map;
    vertices = new Float32Array(Qe * 4 * Ze);
    viewUniform;
    quads = 0;
    bound = null;
    target = null;
    transform = $e;
    blending = !0;
    bounds = null;
    constructor(e, t) {
        this.canvas = e,
        this.width = e.width = t.windowWidth,
        this.height = e.height = t.windowHeight,
        this.pngs = t.texturePages;
        let n = e.getContext(`webgl2`, {
            alpha: !1,
            antialias: !1,
            premultipliedAlpha: !1,
            preserveDrawingBuffer: !0
        });
        if (!n)
            throw Error(`WebGL2 is not available in this browser`);
        this.gl = n;
        let r = nt(n, Ye, Xe);
        n.useProgram(r),
        this.viewUniform = n.getUniformLocation(r, `uView`),
        n.uniform2f(this.viewUniform, this.width, this.height),
        n.uniform1i(n.getUniformLocation(r, `uTex`), 0),
        n.bindVertexArray(n.createVertexArray()),
        n.bindBuffer(n.ARRAY_BUFFER, n.createBuffer()),
        n.bufferData(n.ARRAY_BUFFER, this.vertices.byteLength, n.DYNAMIC_DRAW),
        rt(n, r, `aPos`, 2, 32, 0),
        rt(n, r, `aUv`, 2, 32, 8),
        rt(n, r, `aColor`, 4, 32, 16);
        let i = new Uint16Array(Qe * 6);
        for (let e = 0; e < Qe; e++)
            i.set([e * 4, e * 4 + 1, e * 4 + 2, e * 4 + 2, e * 4 + 1, e * 4 + 3], e * 6);
        n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, n.createBuffer()),
        n.bufferData(n.ELEMENT_ARRAY_BUFFER, i, n.STATIC_DRAW),
        n.enable(n.BLEND),
        n.blendFuncSeparate(n.SRC_ALPHA, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA),
        this.white = this.upload(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]),1,1))
    }
    loadPages(e) {
        return Promise.all([...e].map(e => this.loadPage(e))).then( () => void 0)
    }
    resize(e, t) {
        (e !== this.width || t !== this.height) && (this.flush(),
        this.width = this.canvas.width = e,
        this.height = this.canvas.height = t,
        this.target || this.bindTarget(null))
    }
    begin(e=0) {
        this.setTarget(null),
        this.clear(e, 1)
    }
    end() {
        this.flush()
    }
    clear(e, t) {
        this.flush();
        let n = this.gl;
        n.clearColor((e & 255) / 255, (e >> 8 & 255) / 255, (e >> 16 & 255) / 255, t),
        n.clear(n.COLOR_BUFFER_BIT)
    }
    setView(e, t, n, r, i, a, o, s) {
        this.flush();
        let c = n ? o / n : 1
          , l = r ? s / r : 1;
        this.transform = {
            scaleX: c,
            scaleY: l,
            offsetX: i - e * c,
            offsetY: a - t * l
        }
    }
    resetView() {
        this.flush(),
        this.transform = $e
    }
    setBlending(e) {
        e !== this.blending && (this.flush(),
        this.blending = e,
        e ? this.gl.enable(this.gl.BLEND) : this.gl.disable(this.gl.BLEND))
    }
    createSurface(e, t) {
        let n = this.gl;
        this.flush();
        let r = n.createTexture();
        n.bindTexture(n.TEXTURE_2D, r),
        n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, e, t, 0, n.RGBA, n.UNSIGNED_BYTE, null),
        tt(n);
        let i = n.createFramebuffer();
        return n.bindFramebuffer(n.FRAMEBUFFER, i),
        n.framebufferTexture2D(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0, n.TEXTURE_2D, r, 0),
        n.clearColor(0, 0, 0, 0),
        n.clear(n.COLOR_BUFFER_BIT),
        this.bound = null,
        this.bindTarget(this.target),
        {
            texture: r,
            framebuffer: i,
            width: e,
            height: t,
            flipY: !0
        }
    }
    registerPage(e) {
        let t = Math.max(this.pngs.length, this.pages.length);
        return this.pages[t] = e,
        t
    }
    freeSurface(e) {
        this.target === e && this.setTarget(null),
        this.flush(),
        this.gl.deleteFramebuffer(e.framebuffer),
        this.gl.deleteTexture(e.texture)
    }
    setTarget(e) {
        this.flush(),
        this.target = e,
        this.bindTarget(e)
    }
    getTarget() {
        return this.target
    }
    drawRegion(e, t, n, r, i, a, o, s, c, l, u) {
        let d = this.page(e);
        d && this.drawPage(d, t, n, r, i, a, o, s, c, l, u)
    }
    drawPage(e, t, n, r, i, a, o, s, c, l, u) {
        this.quad(e, t, n, r, i, [{
            x: a,
            y: o
        }, {
            x: a + s,
            y: o
        }, {
            x: a,
            y: o + c
        }, {
            x: a + s,
            y: o + c
        }], [l, l, l, l], u)
    }
    quad(e, t, n, r, i, a, o, s) {
        let c = typeof e == `number` ? this.page(e) : e;
        if (!c)
            return !1;
        let l = n / c.height
          , u = (n + i) / c.height;
        return c.flipY && (l = 1 - l,
        u = 1 - u),
        this.emit(c, t / c.width, l, (t + r) / c.width, u, a, o, s),
        !0
    }
    fillRect(e, t, n, r, i, a=1) {
        this.fillQuad([{
            x: e,
            y: t
        }, {
            x: e + n,
            y: t
        }, {
            x: e,
            y: t + r
        }, {
            x: e + n,
            y: t + r
        }], [i, i, i, i], a)
    }
    fillQuad(e, t, n) {
        this.emit(this.white, 0, 0, 1, 1, e, t, n)
    }
    fillTriangle(e, t, n, r, i) {
        this.emit(this.white, 0, 0, 1, 1, [e, t, n, n], [r[0], r[1], r[2], r[2]], i)
    }
    getPixel(e, t) {
        this.flush();
        let n = this.gl
          , r = this.transform
          , i = Math.floor(e * r.scaleX + r.offsetX)
          , a = this.target ? this.target.height : this.height
          , o = Math.floor(t * r.scaleY + r.offsetY)
          , s = new Uint8Array(4);
        return n.readPixels(i, a - 1 - o, 1, 1, n.RGBA, n.UNSIGNED_BYTE, s),
        s[0] | s[1] << 8 | s[2] << 16
    }
    page(e) {
        return this.pages[e] || (this.loadPage(e),
        null)
    }
    bindTarget(e) {
        let t = this.gl;
        t.bindFramebuffer(t.FRAMEBUFFER, e ? e.framebuffer : null);
        let n = e ? e.width : this.width
          , r = e ? e.height : this.height;
        t.viewport(0, 0, n, r),
        t.uniform2f(this.viewUniform, n, r)
    }
    loadPage(e) {
        if (this.pages[e])
            return Promise.resolve();
        let t = this.loading.get(e);
        return t || (t = (async () => {
            let t = new Blob([this.pngs[e].slice()],{
                type: `image/png`
            })
              , n = await createImageBitmap(t, {
                premultiplyAlpha: `none`,
                colorSpaceConversion: `none`
            });
            this.pages[e] = this.upload(n),
            n.close()
        }
        )(),
        this.loading.set(e, t)),
        t
    }
    upload(e) {
        let t = this.gl;
        this.flush(),
        this.bound = null;
        let n = t.createTexture();
        return t.bindTexture(t.TEXTURE_2D, n),
        t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
        t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, e),
        tt(t),
        {
            texture: n,
            width: e.width,
            height: e.height,
            flipY: !1
        }
    }
    emit(e, t, n, r, i, a, o, s) {
        e !== this.bound && (this.flush(),
        this.bound = e,
        this.gl.bindTexture(this.gl.TEXTURE_2D, e.texture)),
        this.quads === Qe && this.flush();
        let c = this.transform
          , l = [t, n, r, n, t, i, r, i]
          , u = this.vertices
          , d = this.quads * 4 * Ze;
        for (let e = 0; e < 4; e++) {
            let t = o[e]
              , n = a[e].x * c.scaleX + c.offsetX
              , r = a[e].y * c.scaleY + c.offsetY;
            if (this.bounds) {
                let e = this.bounds;
                e.left = Math.min(e.left, n),
                e.top = Math.min(e.top, r),
                e.right = Math.max(e.right, n),
                e.bottom = Math.max(e.bottom, r)
            }
            u[d++] = n,
            u[d++] = r,
            u[d++] = l[e * 2],
            u[d++] = l[e * 2 + 1],
            u[d++] = (t & 255) / 255,
            u[d++] = (t >> 8 & 255) / 255,
            u[d++] = (t >> 16 & 255) / 255,
            u[d++] = s
        }
        this.quads++
    }
    flush() {
        if (this.quads === 0)
            return;
        let e = this.gl;
        e.bufferSubData(e.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.quads * 4 * Ze)),
        e.drawElements(e.TRIANGLES, this.quads * 6, e.UNSIGNED_SHORT, 0),
        this.quads = 0
    }
}
;
function tt(e) {
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE)
}
function nt(e, t, n) {
    let r = e.createProgram();
    for (let[i,a] of [[e.VERTEX_SHADER, t], [e.FRAGMENT_SHADER, n]]) {
        let t = e.createShader(i);
        if (!t)
            throw Error(`WebGL: could not create shader`);
        if (e.shaderSource(t, a),
        e.compileShader(t),
        !e.getShaderParameter(t, e.COMPILE_STATUS))
            throw Error(`WebGL shader: ${e.getShaderInfoLog(t)}`);
        e.attachShader(r, t)
    }
    if (e.linkProgram(r),
    !e.getProgramParameter(r, e.LINK_STATUS))
        throw Error(`WebGL program: ${e.getProgramInfoLog(r)}`);
    return r
}
function rt(e, t, n, r, i, a) {
    let o = e.getAttribLocation(t, n);
    e.enableVertexAttribArray(o),
    e.vertexAttribPointer(o, r, e.FLOAT, !1, i, a)
}
var it = `undertale-web`
  , at = `saves`
  , ot = `meta/active`
  , st = `meta/key`
  , ct = class e {
    slots = {
        imported: new Map,
        new: new Map
    };
    active = `new`;
    key;
    db = null;
    static async open() {
        let t = new e
          , n = null;
        try {
            t.db = await lt();
            let e = t.db.transaction(at, `readonly`).objectStore(at)
              , [r,i] = await Promise.all([ut(e.getAllKeys()), ut(e.getAll())]);
            r.forEach( (e, r) => {
                let a = String(e)
                  , o = i[r];
                a === ot ? (o === `imported` || o === `new`) && (t.active = o) : a === st ? xe(o) && (n = o) : t.restore(a, o)
            }
            )
        } catch (e) {
            console.warn(`Save storage unavailable; saves will last until the page closes.`, e),
            t.db = null
        }
        return t.key = n ?? await t.newSigningKey(),
        t
    }
    get files() {
        return this.slots[this.active]
    }
    hasProgress(e=this.active) {
        return this.slots[e].has(`file0`)
    }
    async use(e, t) {
        if (t) {
            let n = this.slots[e];
            n.clear();
            for (let[e,r] of t)
                n.set(e, r)
        }
        this.active = e,
        await this.write(t => {
            t.delete(IDBKeyRange.bound(`${e}/`, `${e}/￿`));
            for (let[n,r] of this.slots[e])
                t.put(r, `${e}/${n}`);
            t.put(e, ot)
        }
        )
    }
    writeFile(e, t) {
        if (!se(e))
            return;
        let n = this.active;
        t && ce(e, t) ? console.warn(`Not storing ${e}: ${ce(e, t)}`) : (t ? this.slots[n].set(e, t) : this.slots[n].delete(e),
        this.write(r => {
            t ? r.put(t, `${n}/${e}`) : r.delete(`${n}/${e}`)
        }
        ))
    }
    restore(e, t) {
        let[n,r,i] = e.split(`/`);
        n !== `imported` && n !== `new` || i !== void 0 || !se(r ?? ``) || (!(t instanceof Uint8Array) || ce(r, t) ? console.warn(`Dropped an invalid stored save file: ${e}`) : this.slots[n].set(r, t))
    }
    async newSigningKey() {
        let e = await be();
        return await this.write(t => t.put(e, st)),
        e
    }
    async write(e) {
        if (this.db)
            try {
                let t = this.db.transaction(at, `readwrite`);
                e(t.objectStore(at)),
                await dt(t)
            } catch (e) {
                console.warn(`Could not persist saves.`, e)
            }
    }
}
;
function lt() {
    let e = indexedDB.open(it, 1);
    return e.onupgradeneeded = () => e.result.createObjectStore(at),
    ut(e)
}
function ut(e) {
    return new Promise( (t, n) => {
        e.onsuccess = () => t(e.result),
        e.onerror = () => n(e.error)
    }
    )
}
function dt(e) {
    return new Promise( (t, n) => {
        e.oncomplete = () => t(),
        e.onerror = e.onabort = () => n(e.error)
    }
    )
}
var ft = 2e5
  , pt = class {
    nextId = ft;
    resume() {}
    close() {}
    lockMute() {}
    setMuted() {}
    setVolume() {}
    play() {
        return this.nextId++
    }
    stop() {}
    stopAll() {}
    pause() {}
    resumeSound() {}
    pauseAll() {}
    resumeAll() {}
    isPlaying() {
        return !1
    }
    setGain() {}
    getGain() {
        return 1
    }
    setPitch() {}
    getPitch() {
        return 1
    }
    getPosition() {
        return 0
    }
    setPosition() {}
}
  , mt = class {
    data;
    musicUrl;
    ctx = new AudioContext;
    master = this.ctx.createGain();
    buffers = new Map;
    voices = new Map;
    assetGain = new Map;
    nextId = ft;
    constructor(e, t) {
        this.data = e,
        this.musicUrl = t,
        this.master.connect(this.ctx.destination)
    }
    resume() {
        this.ctx.state === `suspended` && this.ctx.resume()
    }
    close() {
        this.stopAll(),
        this.ctx.close()
    }
    muteLocked = !1;
    lockMute() {
        this.muteLocked = !0,
        this.master.gain.value = 0,
        this.master.gain.setValueAtTime(0, this.ctx.currentTime)
    }
    muted = !1;
    volume = 1;
    setMuted(e) {
        this.muted = e,
        this.applyGain()
    }
    setVolume(e) {
        this.volume = Math.min(1, Math.max(0, e)),
        this.applyGain()
    }
    applyGain() {
        this.muteLocked || this.master.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime)
    }
    play(e, t) {
        let n = this.data.sounds[e];
        if (!n)
            return -1;
        let r = this.ctx.createGain();
        r.gain.value = n.volume * (this.assetGain.get(e) ?? 1),
        r.connect(this.master);
        let i = {
            id: this.nextId++,
            sound: n,
            gain: r,
            loop: t,
            pitch: n.pitch || 1,
            paused: !1,
            ended: !1,
            source: null,
            buffer: null,
            startedAt: this.ctx.currentTime,
            offset: 0,
            element: null
        };
        if (this.voices.set(i.id, i),
        n.audioId >= 0)
            this.decode(n).then(e => {
                e && !i.ended && (i.buffer = e,
                i.paused || this.startBuffer(i, 0))
            }
            );
        else {
            let e = this.musicUrl(n.file);
            if (!e)
                return this.finish(i),
                i.id;
            let a = new Audio(e);
            a.loop = t,
            a.preservesPitch = !1,
            a.playbackRate = i.pitch,
            a.addEventListener(`ended`, () => {
                i.loop || this.finish(i)
            }
            ),
            this.ctx.createMediaElementSource(a).connect(r),
            i.element = a,
            a.play().catch( () => void 0)
        }
        return i.id
    }
    stop(e) {
        for (let t of this.matching(e))
            this.finish(t)
    }
    stopAll() {
        for (let e of [...this.voices.values()])
            this.finish(e)
    }
    pause(e) {
        for (let t of this.matching(e))
            this.pauseVoice(t)
    }
    resumeSound(e) {
        for (let t of this.matching(e))
            this.resumeVoice(t)
    }
    pauseAll() {
        for (let e of this.voices.values())
            this.pauseVoice(e)
    }
    resumeAll() {
        for (let e of this.voices.values())
            this.resumeVoice(e)
    }
    isPlaying(e) {
        return this.matching(e).some(e => !e.ended && !e.paused)
    }
    setGain(e, t, n) {
        let r = this.ctx.currentTime + Math.max(0, n) / 1e3;
        e < ft && this.assetGain.set(e, t);
        for (let i of this.matching(e)) {
            let e = i.sound.volume * t;
            i.gain.gain.cancelScheduledValues(this.ctx.currentTime),
            i.gain.gain.setValueAtTime(i.gain.gain.value, this.ctx.currentTime),
            n > 0 ? i.gain.gain.linearRampToValueAtTime(e, r) : i.gain.gain.setValueAtTime(e, this.ctx.currentTime)
        }
    }
    getGain(e) {
        let t = this.matching(e)[0];
        return t ? t.gain.gain.value / (t.sound.volume || 1) : this.assetGain.get(e) ?? 1
    }
    setPitch(e, t) {
        for (let n of this.matching(e))
            n.offset = this.position(n),
            n.startedAt = this.ctx.currentTime,
            n.pitch = t,
            n.source && (n.source.playbackRate.value = t),
            n.element && (n.element.playbackRate = t)
    }
    getPitch(e) {
        return this.matching(e)[0]?.pitch ?? 1
    }
    getPosition(e) {
        let t = this.matching(e)[0];
        return t ? this.position(t) : 0
    }
    setPosition(e, t) {
        for (let n of this.matching(e))
            n.element ? n.element.currentTime = t : n.buffer && !n.paused ? this.startBuffer(n, t) : n.offset = t
    }
    matching(e) {
        if (e >= ft) {
            let t = this.voices.get(e);
            return t ? [t] : []
        }
        return [...this.voices.values()].filter(t => t.sound.index === e)
    }
    position(e) {
        if (e.element)
            return e.element.currentTime;
        if (e.paused || !e.source)
            return e.offset;
        let t = e.offset + (this.ctx.currentTime - e.startedAt) * e.pitch;
        return e.buffer && e.loop ? t % e.buffer.duration : t
    }
    startBuffer(e, t) {
        e.source && (e.source.onended = null,
        e.source.stop());
        let n = this.ctx.createBufferSource();
        n.buffer = e.buffer,
        n.loop = e.loop,
        n.playbackRate.value = e.pitch,
        n.connect(e.gain),
        n.onended = () => {
            !e.loop && e.source === n && !e.paused && this.finish(e)
        }
        ,
        n.start(0, Math.max(0, t) % (e.buffer?.duration || 1)),
        e.source = n,
        e.offset = t,
        e.startedAt = this.ctx.currentTime
    }
    pauseVoice(e) {
        e.paused || e.ended || (e.offset = this.position(e),
        e.paused = !0,
        e.element && e.element.pause(),
        e.source &&= (e.source.onended = null,
        e.source.stop(),
        null))
    }
    resumeVoice(e) {
        e.paused && !e.ended && (e.paused = !1,
        e.element ? e.element.play().catch( () => void 0) : e.buffer && this.startBuffer(e, e.offset))
    }
    finish(e) {
        e.ended || (e.ended = !0,
        e.source && (e.source.onended = null,
        e.source.stop()),
        e.element && (e.element.pause(),
        e.element.removeAttribute(`src`)),
        e.gain.disconnect(),
        this.voices.delete(e.id))
    }
    decode(e) {
        let t = this.buffers.get(e.audioId);
        if (!t) {
            let n = this.data.audio[e.audioId];
            t = n ? this.ctx.decodeAudioData(n.slice().buffer).catch(t => (console.warn(`Could not decode ${e.name}`, t),
            null)) : Promise.resolve(null),
            this.buffers.set(e.audioId, t)
        }
        return t
    }
}
  , ht = new TextEncoder
  , gt = new TextDecoder
  , _t = class e {
    files;
    persist;
    ini = null;
    handles = new Map;
    nextHandle = 1;
    constructor(e, t) {
        this.files = e,
        this.persist = t
    }
    static normalize(e) {
        return e.replace(/^.*[\\/]/, ``).toLowerCase()
    }
    exists(t) {
        return this.files.has(e.normalize(t))
    }
    read(t) {
        let n = this.files.get(e.normalize(t));
        return n ? gt.decode(n) : null
    }
    write(t, n) {
        let r = e.normalize(t)
          , i = ht.encode(n);
        this.files.set(r, i),
        this.persist(r, i)
    }
    delete(t) {
        let n = e.normalize(t);
        this.files.delete(n) && this.persist(n, null)
    }
    rename(e, t) {
        let n = this.read(e);
        n !== null && (this.delete(e),
        this.write(t, n))
    }
    iniOpen(t) {
        this.iniClose(),
        this.ini = {
            name: e.normalize(t),
            data: vt(this.read(t) ?? ``),
            dirty: !1
        }
    }
    iniOpenFromString(e) {
        this.iniClose(),
        this.ini = {
            name: null,
            data: vt(e),
            dirty: !1
        }
    }
    iniClose() {
        if (!this.ini)
            return ``;
        let e = yt(this.ini.data);
        return this.ini.name && this.ini.dirty && this.write(this.ini.name, e),
        this.ini = null,
        e
    }
    iniRead(e, t) {
        return this.ini?.data.get(e)?.get(t)
    }
    iniWrite(e, t, n) {
        if (!this.ini)
            return;
        let r = this.ini.data.get(e);
        r || this.ini.data.set(e, r = new Map),
        r.set(t, n),
        this.ini.dirty = !0
    }
    iniSectionExists(e) {
        return this.ini?.data.has(e) ?? !1
    }
    textOpen(t, n) {
        let r = n ? `` : this.read(t);
        if (r === null)
            return -1;
        let i = this.nextHandle++;
        return this.handles.set(i, {
            name: e.normalize(t),
            write: n,
            text: r,
            pos: 0
        }),
        i
    }
    textClose(e) {
        let t = this.handles.get(e);
        t && (t.write && this.write(t.name, t.text),
        this.handles.delete(e))
    }
    textWrite(e, t) {
        let n = this.handles.get(e);
        n?.write && (n.text += t)
    }
    textReadReal(e) {
        let t = this.handles.get(e);
        if (!t)
            return 0;
        let n = /^[ \t]*([-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?)/.exec(t.text.slice(t.pos));
        return n ? (t.pos += n[0].length,
        Number(n[1])) : 0
    }
    textReadString(e) {
        let t = this.handles.get(e);
        if (!t)
            return ``;
        let n = t.text.indexOf(`
`, t.pos);
        n < 0 && (n = t.text.length);
        let r = t.text.slice(t.pos, n).replace(/\r$/, ``);
        return t.pos = n,
        r
    }
    textReadln(e) {
        let t = this.handles.get(e);
        if (!t)
            return ``;
        let n = t.text.indexOf(`
`, t.pos);
        n = n < 0 ? t.text.length : n + 1;
        let r = t.text.slice(t.pos, n).replace(/\r?\n$/, ``);
        return t.pos = n,
        r
    }
    textEof(e) {
        let t = this.handles.get(e);
        return !t || t.pos >= t.text.length
    }
}
;
function vt(e) {
    let t = new Map
      , n = null;
    for (let r of e.split(/\r?\n/)) {
        let e = r.trim();
        if (!e || e.startsWith(`;`))
            continue;
        let i = /^\[(.*)\]$/.exec(e);
        if (i) {
            n = t.get(i[1]) ?? new Map,
            t.set(i[1], n);
            continue
        }
        let a = e.indexOf(`=`);
        if (a < 0 || !n)
            continue;
        let o = e.slice(a + 1).trim();
        o.length >= 2 && o.startsWith(`"`) && o.endsWith(`"`) && (o = o.slice(1, -1)),
        n.set(e.slice(0, a).trim(), o)
    }
    return t
}
function yt(e) {
    let t = ``;
    for (let[n,r] of e) {
        t += `[${n}]\r\n`;
        for (let[e,n] of r)
            t += `${e}="${n}"\r\n`
    }
    return t
}
var bt = 32e3
  , xt = class e {
    rows = [];
    get(e) {
        let t = this.rows[Math.floor(e / bt)];
        return t ? t[e % bt] : void 0
    }
    set(e, t) {
        let n = Math.floor(e / bt);
        (this.rows[n] ??= [])[e % bt] = t
    }
    clone() {
        let t = new e;
        return this.rows.forEach( (e, n) => {
            e && (t.rows[n] = e.slice())
        }
        ),
        t
    }
}
;
function S(e) {
    return typeof e == `number` && e > .5
}
function C(e) {
    if (typeof e == `number`)
        return e;
    if (typeof e == `string`) {
        let t = Number(e.trim());
        return Number.isFinite(t) ? t : 0
    }
    return 0
}
function w(e) {
    return Math.trunc(C(e))
}
function St(e) {
    return typeof e == `string` ? e : typeof e == `number` ? Number.isInteger(e) ? String(e) : Number.isFinite(e) ? e.toFixed(2) : e > 0 ? `inf` : e < 0 ? `-inf` : `nan` : e instanceof xt ? `array` : `undefined`
}
var Ct = 1e-5;
function wt(e, t) {
    if (typeof e == `string` && typeof t == `string`)
        return e < t ? -1 : +(e > t);
    if (typeof e == `string` || typeof t == `string`)
        return typeof e == `string` ? 1 : -1;
    let n = C(e)
      , r = C(t);
    return Math.abs(n - r) < Ct ? 0 : n < r ? -1 : 1
}
function Tt(e) {
    let t = Math.round(e);
    return Math.abs(e % 1) === .5 && t % 2 != 0 ? t - 1 : t
}
var T = C
  , E = w
  , D = S
  , O = e => typeof e == `string` ? e : St(e)
  , k = Math.PI / 180;
function Et(e) {
    return e.data.fontList[e.drawFont] ?? e.data.fontList[0]
}
function Dt(e) {
    return e.replace(/\r\n/g, `
`).split(/(?<!\\)#|\n/).map(e => e.replace(/\\#/g, `#`))
}
function Ot(e) {
    return e.glyphs.get(77)?.height ?? e.lineHeight
}
function kt(e, t) {
    let n = 0;
    for (let r of t)
        n += e.glyphs.get(r.codePointAt(0) ?? 0)?.shift ?? Math.ceil(e.size / 2);
    return n
}
function At(e, t, n) {
    if (n < 0)
        return t;
    let r = [];
    for (let i of t) {
        let t = ``;
        for (let a of i.split(` `)) {
            let i = t ? `${t} ${a}` : a;
            t && kt(e, i) > n ? (r.push(t),
            t = a) : t = i
        }
        r.push(t)
    }
    return r
}
function A(e, t, n, r, i, a, o, s, c, l=-1, u=-1) {
    let d = Et(e);
    if (!d)
        return;
    let f = At(d, Dt(r), u)
      , p = l >= 0 ? l : Ot(d)
      , m = f.length * p
      , h = e.valign === 1 ? -m / 2 : e.valign === 2 ? -m : 0
      , g = i * d.scaleX
      , ee = a * d.scaleY
      , te = -o * k
      , ne = Math.cos(te)
      , _ = Math.sin(te)
      , v = (e, r) => o === 0 ? {
        x: t + e,
        y: n + r
    } : {
        x: t + e * ne - r * _,
        y: n + e * _ + r * ne
    }
      , y = d.item;
    f.forEach( (t, n) => {
        let r = kt(d, t)
          , i = e.halign === 1 ? -r / 2 : e.halign === 2 ? -r : 0
          , a = h + n * p;
        for (let n of t) {
            let t = d.glyphs.get(n.codePointAt(0) ?? 0);
            if (t && t.width > 0) {
                let n = (i + t.offset) * g
                  , r = a * ee
                  , o = t.width * g
                  , l = t.height * ee
                  , u = [v(n, r), v(n + o, r), v(n, r + l), v(n + o, r + l)];
                e.renderer.quad(y.page, y.sourceX + t.x, y.sourceY + t.y, t.width, t.height, u, s, c)
            }
            i += t?.shift ?? Math.ceil(d.size / 2)
        }
    }
    )
}
function jt(e, t, n=-1, r=-1) {
    let i = Et(e);
    if (!i)
        return {
            w: 0,
            h: 0
        };
    let a = At(i, Dt(t), r);
    return {
        w: Math.max(0, ...a.map(e => kt(i, e))) * i.scaleX,
        h: a.length * (n >= 0 ? n : Ot(i)) * i.scaleY
    }
}
function j(e, t) {
    return e.data.spriteList[E(t)]
}
function Mt(e, t) {
    let n = T(t);
    return n < 0 ? e.self.imageIndex : n
}
function Nt(e, t, n, r, i, a, o, s, c, l, u, d) {
    let f = Math.max(n, t.targetX)
      , p = Math.max(r, t.targetY)
      , m = Math.min(n + i, t.targetX + t.targetWidth)
      , h = Math.min(r + a, t.targetY + t.targetHeight);
    if (m <= f || h <= p)
        return;
    let g = t.sourceWidth / t.targetWidth
      , ee = t.sourceHeight / t.targetHeight;
    e.renderer.drawRegion(t.page, t.sourceX + (f - t.targetX) * g, t.sourceY + (p - t.targetY) * ee, (m - f) * g, (h - p) * ee, o + (f - n) * c, s + (p - r) * l, (m - f) * c, (h - p) * l, u, d)
}
function Pt(e, t) {
    let n = e.frames.length;
    if (n)
        return e.frames[(Math.floor(t) % n + n) % n]
}
function Ft(e, t, n, r, i) {
    let a = Math.max(4, e.circlePrecision);
    return Array.from({
        length: a
    }, (e, o) => {
        let s = o / a * Math.PI * 2;
        return {
            x: t + Math.cos(s) * r,
            y: n + Math.sin(s) * i
        }
    }
    )
}
function M(e, t, n, r, i, a, o, s) {
    let c = Math.hypot(r - t, i - n);
    if (c === 0) {
        e.renderer.fillRect(t, n, a, a, o, e.drawAlpha);
        return
    }
    let l = -(i - n) / c * (a / 2)
      , u = (r - t) / c * (a / 2);
    e.renderer.fillQuad([{
        x: t + l,
        y: n + u
    }, {
        x: r + l,
        y: i + u
    }, {
        x: t - l,
        y: n - u
    }, {
        x: r - l,
        y: i - u
    }], [o, s, o, s], e.drawAlpha)
}
function It(e, t, n, r, i, a, o) {
    let s = Math.min(t, r)
      , c = Math.min(n, i)
      , l = Math.max(t, r) + 1
      , u = Math.max(n, i) + 1;
    o || ([s,c,l,u] = e.coverArea(s, c, l, u)),
    o ? (M(e, s, c + .5, l, c + .5, 1, a[0], a[1]),
    M(e, s, u - .5, l, u - .5, 1, a[3], a[2]),
    M(e, s + .5, c, s + .5, u, 1, a[0], a[3]),
    M(e, l - .5, c, l - .5, u, 1, a[1], a[2])) : e.renderer.fillQuad([{
        x: s,
        y: c
    }, {
        x: l,
        y: c
    }, {
        x: s,
        y: u
    }, {
        x: l,
        y: u
    }], [a[0], a[1], a[3], a[2]], e.drawAlpha)
}
function Lt(e, t, n, r, i, a, o, s) {
    let c = (t + r) / 2
      , l = (n + i) / 2
      , u = Ft(e, c, l, Math.abs(r - t) / 2, Math.abs(i - n) / 2);
    u.forEach( (t, n) => {
        let r = u[(n + 1) % u.length];
        s ? M(e, t.x, t.y, r.x, r.y, 1, o, o) : e.renderer.fillTriangle({
            x: c,
            y: l
        }, t, r, [a, o, o], e.drawAlpha)
    }
    )
}
function N(e, t) {
    return e.surfaces.get(t)
}
function Rt() {
    let e = new Date;
    return (e.getTime() - e.getTimezoneOffset() * 6e4) / 864e5 + 25569
}
function zt(e, t, n) {
    let r = e / 255 * 360 % 360
      , i = t / 255
      , a = n / 255
      , o = a * i
      , s = o * (1 - Math.abs(r / 60 % 2 - 1))
      , c = a - o
      , [l,u,d] = r < 60 ? [o, s, 0] : r < 120 ? [s, o, 0] : r < 180 ? [0, o, s] : r < 240 ? [0, s, o] : r < 300 ? [s, 0, o] : [o, 0, s];
    return Math.round((l + c) * 255) | Math.round((u + c) * 255) << 8 | Math.round((d + c) * 255) << 16
}
function Bt(e, t, n, r) {
    let i = e.bounds(t);
    if (!i)
        return Math.hypot(n - t.x, r - t.y);
    let a = Math.max(i.left - n, 0, n - i.right)
      , o = Math.max(i.top - r, 0, r - i.bottom);
    return Math.hypot(a, o)
}
function P(e, t) {
    return e.dsMaps.get(E(t))
}
var Vt = {
    32769: 0,
    32770: 1,
    32771: 2,
    32772: 3,
    32773: 4,
    32774: 5,
    32775: 6,
    32776: 7,
    32777: 8,
    32778: 9,
    32779: 10,
    32780: 11,
    32781: 12,
    32782: 13,
    32783: 14,
    32784: 15
}
  , Ht = {
    32785: 0,
    32786: 1,
    32787: 2,
    32788: 3
};
function Ut(e) {
    return navigator.getGamepads?.()[e] ?? null
}
function F(e) {
    return typeof e == `number` ? e : O(e)
}
function I(e, t, n) {
    return e.actionRelative ? t + n : n
}
var Wt = {
    abs: (e, t, n) => Math.abs(T(n[0])),
    sign: (e, t, n) => Math.sign(T(n[0])),
    floor: (e, t, n) => Math.floor(T(n[0])),
    ceil: (e, t, n) => Math.ceil(T(n[0])),
    round: (e, t, n) => Tt(T(n[0])),
    frac: (e, t, n) => T(n[0]) % 1,
    sqr: (e, t, n) => T(n[0]) ** 2,
    sqrt: (e, t, n) => Math.sqrt(T(n[0])),
    power: (e, t, n) => T(n[0]) ** T(n[1]),
    exp: (e, t, n) => Math.exp(T(n[0])),
    ln: (e, t, n) => Math.log(T(n[0])),
    sin: (e, t, n) => Math.sin(T(n[0])),
    cos: (e, t, n) => Math.cos(T(n[0])),
    tan: (e, t, n) => Math.tan(T(n[0])),
    arctan2: (e, t, n) => Math.atan2(T(n[0]), T(n[1])),
    darctan2: (e, t, n) => Math.atan2(T(n[0]), T(n[1])) / k,
    dsin: (e, t, n) => Math.sin(T(n[0]) * k),
    dcos: (e, t, n) => Math.cos(T(n[0]) * k),
    degtorad: (e, t, n) => T(n[0]) * k,
    radtodeg: (e, t, n) => T(n[0]) / k,
    max: (e, t, n) => Math.max(...n.map(T)),
    min: (e, t, n) => Math.min(...n.map(T)),
    mean: (e, t, n) => n.reduce( (e, t) => e + T(t), 0) / Math.max(1, n.length),
    clamp: (e, t, n) => Math.min(Math.max(T(n[0]), T(n[1])), T(n[2])),
    lerp: (e, t, n) => T(n[0]) + (T(n[1]) - T(n[0])) * T(n[2]),
    random: (e, t, n) => e.random() * T(n[0]),
    random_range: (e, t, n) => T(n[0]) + e.random() * (T(n[1]) - T(n[0])),
    irandom: (e, t, n) => Math.floor(e.random() * (E(n[0]) + 1)),
    irandom_range: (e, t, n) => E(n[0]) + Math.floor(e.random() * (E(n[1]) - E(n[0]) + 1)),
    choose: (e, t, n) => n[Math.floor(e.random() * n.length)],
    randomize: e => e.setRandomSeed(Math.random() * 4294967296),
    random_set_seed: (e, t, n) => e.setRandomSeed(E(n[0])),
    random_get_seed: e => e.randomSeed,
    point_direction: (e, t, n) => {
        let r = Math.atan2(-(T(n[3]) - T(n[1])), T(n[2]) - T(n[0])) / k;
        return r < 0 ? r + 360 : r
    }
    ,
    point_distance: (e, t, n) => Math.hypot(T(n[2]) - T(n[0]), T(n[3]) - T(n[1])),
    lengthdir_x: (e, t, n) => Math.cos(T(n[1]) * k) * T(n[0]),
    lengthdir_y: (e, t, n) => -Math.sin(T(n[1]) * k) * T(n[0]),
    make_color_rgb: (e, t, n) => E(n[0]) & 255 | (E(n[1]) & 255) << 8 | (E(n[2]) & 255) << 16,
    make_colour_rgb: (e, t, n) => E(n[0]) & 255 | (E(n[1]) & 255) << 8 | (E(n[2]) & 255) << 16,
    make_color_hsv: (e, t, n) => zt(T(n[0]), T(n[1]), T(n[2])),
    make_colour_hsv: (e, t, n) => zt(T(n[0]), T(n[1]), T(n[2])),
    merge_color: (e, t, n) => {
        let r = E(n[0])
          , i = E(n[1])
          , a = Math.min(1, Math.max(0, T(n[2])))
          , o = e => Math.round((r >> e & 255) * (1 - a) + (i >> e & 255) * a) << e;
        return o(0) | o(8) | o(16)
    }
    ,
    color_get_red: (e, t, n) => E(n[0]) & 255,
    color_get_green: (e, t, n) => E(n[0]) >> 8 & 255,
    color_get_blue: (e, t, n) => E(n[0]) >> 16 & 255,
    string: (e, t, n) => St(n[0]),
    real: (e, t, n) => T(n[0]),
    chr: (e, t, n) => String.fromCharCode(E(n[0])),
    ord: (e, t, n) => O(n[0]).charCodeAt(0) || 0,
    is_undefined: (e, t, n) => +(n[0] === void 0),
    is_string: (e, t, n) => +(typeof n[0] == `string`),
    is_real: (e, t, n) => +(typeof n[0] == `number`),
    string_length: (e, t, n) => O(n[0]).length,
    string_byte_length: (e, t, n) => new TextEncoder().encode(O(n[0])).length,
    string_char_at: (e, t, n) => {
        let r = O(n[0])
          , i = E(n[1]);
        return r.charAt(Math.max(1, i) - 1)
    }
    ,
    string_copy: (e, t, n) => {
        let r = O(n[0])
          , i = Math.max(1, E(n[1]));
        return r.substr(i - 1, Math.max(0, E(n[2])))
    }
    ,
    string_delete: (e, t, n) => {
        let r = O(n[0])
          , i = Math.max(1, E(n[1])) - 1;
        return r.slice(0, i) + r.slice(i + Math.max(0, E(n[2])))
    }
    ,
    string_insert: (e, t, n) => {
        let r = O(n[1])
          , i = Math.max(1, E(n[2])) - 1;
        return r.slice(0, i) + O(n[0]) + r.slice(i)
    }
    ,
    string_pos: (e, t, n) => O(n[1]).indexOf(O(n[0])) + 1,
    string_lower: (e, t, n) => O(n[0]).toLowerCase(),
    string_upper: (e, t, n) => O(n[0]).toUpperCase(),
    string_repeat: (e, t, n) => O(n[0]).repeat(Math.max(0, E(n[1]))),
    string_replace: (e, t, n) => O(n[0]).replace(O(n[1]), O(n[2])),
    string_replace_all: (e, t, n) => O(n[1]) === `` ? O(n[0]) : O(n[0]).split(O(n[1])).join(O(n[2])),
    string_count: (e, t, n) => O(n[0]) === `` ? 0 : O(n[1]).split(O(n[0])).length - 1,
    string_digits: (e, t, n) => O(n[0]).replace(/\D/g, ``),
    string_letters: (e, t, n) => O(n[0]).replace(/[^A-Za-z]/g, ``),
    string_width: (e, t, n) => jt(e, O(n[0])).w,
    string_height: (e, t, n) => jt(e, O(n[0])).h,
    string_width_ext: (e, t, n) => jt(e, O(n[0]), T(n[1]), T(n[2])).w,
    string_height_ext: (e, t, n) => jt(e, O(n[0]), T(n[1]), T(n[2])).h,
    draw_set_color: (e, t, n) => void (e.drawColor = E(n[0])),
    draw_set_colour: (e, t, n) => void (e.drawColor = E(n[0])),
    draw_get_color: e => e.drawColor,
    draw_get_colour: e => e.drawColor,
    draw_set_alpha: (e, t, n) => void (e.drawAlpha = T(n[0])),
    draw_get_alpha: e => e.drawAlpha,
    draw_set_font: (e, t, n) => void (e.drawFont = E(n[0])),
    draw_set_halign: (e, t, n) => void (e.halign = E(n[0])),
    draw_set_valign: (e, t, n) => void (e.valign = E(n[0])),
    draw_set_circle_precision: (e, t, n) => void (e.circlePrecision = Math.max(4, E(n[0]))),
    draw_enable_alphablend: (e, t, n) => e.renderer.setBlending(D(n[0])),
    texture_set_interpolation: () => 0,
    draw_clear: (e, t, n) => e.renderer.clear(E(n[0]), 1),
    draw_clear_alpha: (e, t, n) => e.renderer.clear(E(n[0]), T(n[1])),
    draw_getpixel: (e, t, n) => e.renderer.getPixel(T(n[0]), T(n[1])),
    draw_self: (e, t) => e.drawSelf(t.self),
    draw_sprite: (e, t, n) => {
        let r = j(e, n[0]);
        r && e.drawSprite(r, Mt(t, n[1]), T(n[2]), T(n[3]), 1, 1, 0, 16777215, e.drawAlpha)
    }
    ,
    draw_sprite_ext: (e, t, n) => {
        let r = j(e, n[0]);
        r && e.drawSprite(r, Mt(t, n[1]), T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), E(n[7]), T(n[8]))
    }
    ,
    draw_sprite_stretched: (e, t, n) => {
        let r = j(e, n[0]);
        r && e.drawSprite(r, Mt(t, n[1]), T(n[2]) + r.originX * (T(n[4]) / r.width), T(n[3]) + r.originY * (T(n[5]) / r.height), T(n[4]) / r.width, T(n[5]) / r.height, 0, 16777215, e.drawAlpha)
    }
    ,
    draw_sprite_part: (e, t, n) => {
        let r = j(e, n[0])
          , i = r && Pt(r, Mt(t, n[1]));
        i && Nt(e, i, T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), T(n[7]), 1, 1, 16777215, e.drawAlpha)
    }
    ,
    draw_sprite_part_ext: (e, t, n) => {
        let r = j(e, n[0])
          , i = r && Pt(r, Mt(t, n[1]));
        i && Nt(e, i, T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), T(n[7]), T(n[8]), T(n[9]), E(n[10]), T(n[11]))
    }
    ,
    draw_background: (e, t, n) => {
        let r = e.data.backgrounds[E(n[0])]?.item;
        r && e.drawItem(r, T(n[1]), T(n[2]), 0, 0, 1, 1, 0, 16777215, e.drawAlpha)
    }
    ,
    draw_background_ext: (e, t, n) => {
        let r = e.data.backgrounds[E(n[0])]?.item;
        r && e.drawItem(r, T(n[1]), T(n[2]), 0, 0, T(n[3]), T(n[4]), T(n[5]), E(n[6]), T(n[7]))
    }
    ,
    draw_background_stretched: (e, t, n) => {
        let r = e.data.backgrounds[E(n[0])]?.item;
        r && e.drawItem(r, T(n[1]), T(n[2]), 0, 0, T(n[3]) / r.boundingWidth, T(n[4]) / r.boundingHeight, 0, 16777215, e.drawAlpha)
    }
    ,
    draw_background_part: (e, t, n) => {
        let r = e.data.backgrounds[E(n[0])]?.item;
        r && Nt(e, r, T(n[1]), T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), 1, 1, 16777215, e.drawAlpha)
    }
    ,
    draw_background_part_ext: (e, t, n) => {
        let r = e.data.backgrounds[E(n[0])]?.item;
        r && Nt(e, r, T(n[1]), T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), T(n[7]), T(n[8]), E(n[9]), T(n[10]))
    }
    ,
    draw_text: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), 1, 1, 0, [, , , , ].fill(e.drawColor), e.drawAlpha),
    draw_text_ext: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), 1, 1, 0, [, , , , ].fill(e.drawColor), e.drawAlpha, T(n[3]), T(n[4])),
    draw_text_transformed: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), T(n[3]), T(n[4]), T(n[5]), [, , , , ].fill(e.drawColor), e.drawAlpha),
    draw_text_color: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), 1, 1, 0, [E(n[3]), E(n[4]), E(n[6]), E(n[5])], T(n[7])),
    draw_text_colour: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), 1, 1, 0, [E(n[3]), E(n[4]), E(n[6]), E(n[5])], T(n[7])),
    draw_text_transformed_color: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), T(n[3]), T(n[4]), T(n[5]), [E(n[6]), E(n[7]), E(n[9]), E(n[8])], T(n[10])),
    draw_text_transformed_colour: (e, t, n) => A(e, T(n[0]), T(n[1]), O(n[2]), T(n[3]), T(n[4]), T(n[5]), [E(n[6]), E(n[7]), E(n[9]), E(n[8])], T(n[10])),
    draw_point: (e, t, n) => e.renderer.fillRect(T(n[0]), T(n[1]), 1, 1, e.drawColor, e.drawAlpha),
    draw_point_color: (e, t, n) => e.renderer.fillRect(T(n[0]), T(n[1]), 1, 1, E(n[2]), e.drawAlpha),
    draw_point_colour: (e, t, n) => e.renderer.fillRect(T(n[0]), T(n[1]), 1, 1, E(n[2]), e.drawAlpha),
    draw_line: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), 1, e.drawColor, e.drawColor),
    draw_line_width: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), T(n[4]), e.drawColor, e.drawColor),
    draw_line_color: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), 1, E(n[4]), E(n[5])),
    draw_line_colour: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), 1, E(n[4]), E(n[5])),
    draw_line_width_color: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), T(n[4]), E(n[5]), E(n[6])),
    draw_line_width_colour: (e, t, n) => M(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), T(n[4]), E(n[5]), E(n[6])),
    draw_rectangle: (e, t, n) => It(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), [, , , , ].fill(e.drawColor), D(n[4])),
    draw_rectangle_color: (e, t, n) => It(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), [E(n[4]), E(n[5]), E(n[6]), E(n[7])], D(n[8])),
    draw_rectangle_colour: (e, t, n) => It(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), [E(n[4]), E(n[5]), E(n[6]), E(n[7])], D(n[8])),
    draw_roundrect: (e, t, n) => It(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), [, , , , ].fill(e.drawColor), D(n[4])),
    draw_circle: (e, t, n) => {
        let r = T(n[2]);
        Lt(e, T(n[0]) - r, T(n[1]) - r, T(n[0]) + r, T(n[1]) + r, e.drawColor, e.drawColor, D(n[3]))
    }
    ,
    draw_circle_color: (e, t, n) => {
        let r = T(n[2]);
        Lt(e, T(n[0]) - r, T(n[1]) - r, T(n[0]) + r, T(n[1]) + r, E(n[3]), E(n[4]), D(n[5]))
    }
    ,
    draw_ellipse: (e, t, n) => Lt(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), e.drawColor, e.drawColor, D(n[4])),
    draw_ellipse_color: (e, t, n) => Lt(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), E(n[4]), E(n[5]), D(n[6])),
    draw_ellipse_colour: (e, t, n) => Lt(e, T(n[0]), T(n[1]), T(n[2]), T(n[3]), E(n[4]), E(n[5]), D(n[6])),
    draw_triangle: (e, t, n) => Wt.draw_triangle_color(e, t, [n[0], n[1], n[2], n[3], n[4], n[5], e.drawColor, e.drawColor, e.drawColor, n[6]]),
    draw_triangle_color: (e, t, n) => {
        let r = [{
            x: T(n[0]),
            y: T(n[1])
        }, {
            x: T(n[2]),
            y: T(n[3])
        }, {
            x: T(n[4]),
            y: T(n[5])
        }]
          , i = [E(n[6]), E(n[7]), E(n[8])];
        if (D(n[9]))
            for (let t = 0; t < 3; t++)
                M(e, r[t].x, r[t].y, r[(t + 1) % 3].x, r[(t + 1) % 3].y, 1, i[t], i[(t + 1) % 3]);
        else
            e.renderer.fillTriangle(r[0], r[1], r[2], i, e.drawAlpha)
    }
    ,
    surface_create: (e, t, n) => e.createSurface(T(n[0]), T(n[1])),
    surface_free: (e, t, n) => e.freeSurface(E(n[0])),
    surface_exists: (e, t, n) => +!!e.surfaces.has(E(n[0])),
    surface_get_width: (e, t, n) => N(e, E(n[0]))?.width ?? -1,
    surface_get_height: (e, t, n) => N(e, E(n[0]))?.height ?? -1,
    surface_set_target: (e, t, n) => {
        let r = N(e, E(n[0]));
        return r ? (e.pushTarget(r),
        1) : 0
    }
    ,
    surface_reset_target: e => e.popTarget(),
    draw_surface: (e, t, n) => {
        let r = N(e, E(n[0]));
        r && e.renderer.drawPage(r, 0, 0, r.width, r.height, T(n[1]), T(n[2]), r.width, r.height, 16777215, e.drawAlpha)
    }
    ,
    draw_surface_ext: (e, t, n) => {
        let r = N(e, E(n[0]));
        if (!r)
            return;
        let i = T(n[1])
          , a = T(n[2])
          , o = T(n[3])
          , s = T(n[4])
          , c = -T(n[5]) * k
          , l = Math.cos(c)
          , u = Math.sin(c)
          , d = (e, t) => ({
            x: i + e * l - t * u,
            y: a + e * u + t * l
        })
          , f = r.width * o
          , p = r.height * s
          , m = E(n[6]);
        e.renderer.quad(r, 0, 0, r.width, r.height, [d(0, 0), d(f, 0), d(0, p), d(f, p)], [m, m, m, m], T(n[7]))
    }
    ,
    draw_surface_part: (e, t, n) => {
        let r = N(e, E(n[0]));
        r && e.renderer.drawPage(r, T(n[1]), T(n[2]), T(n[3]), T(n[4]), T(n[5]), T(n[6]), T(n[3]), T(n[4]), 16777215, e.drawAlpha)
    }
    ,
    draw_surface_stretched: (e, t, n) => {
        let r = N(e, E(n[0]));
        r && e.renderer.drawPage(r, 0, 0, r.width, r.height, T(n[1]), T(n[2]), T(n[3]), T(n[4]), 16777215, e.drawAlpha)
    }
    ,
    application_surface_enable: (e, t, n) => void (e.appSurfaceEnabled = D(n[0])),
    application_surface_draw_enable: (e, t, n) => void (e.appSurfaceDraw = D(n[0])),
    sprite_create_from_surface: (e, t, n) => e.spriteFromSurface(E(n[0]), T(n[1]), T(n[2]), T(n[3]), T(n[4]), T(n[7]), T(n[8])),
    sprite_exists: (e, t, n) => +!!j(e, n[0]),
    sprite_get_width: (e, t, n) => j(e, n[0])?.width ?? 0,
    sprite_get_height: (e, t, n) => j(e, n[0])?.height ?? 0,
    sprite_get_number: (e, t, n) => j(e, n[0])?.frames.length ?? 0,
    sprite_get_xoffset: (e, t, n) => j(e, n[0])?.originX ?? 0,
    sprite_get_yoffset: (e, t, n) => j(e, n[0])?.originY ?? 0,
    sprite_get_name: (e, t, n) => j(e, n[0])?.name ?? `<undefined>`,
    sprite_delete: (e, t, n) => e.deleteSprite(E(n[0])),
    sprite_replace: () => 0,
    sprite_prefetch: () => 0,
    sprite_collision_mask: () => 0,
    background_get_width: (e, t, n) => e.data.backgrounds[E(n[0])]?.item?.boundingWidth ?? 0,
    background_get_height: (e, t, n) => e.data.backgrounds[E(n[0])]?.item?.boundingHeight ?? 0,
    tile_layer_hide: (e, t, n) => void e.hiddenTileDepths.add(T(n[0])),
    tile_layer_show: (e, t, n) => void e.hiddenTileDepths.delete(T(n[0])),
    tile_layer_shift: (e, t, n) => {
        for (let t of e.tiles)
            t.depth === T(n[0]) && (t.x += T(n[1]),
            t.y += T(n[2]))
    }
    ,
    instance_create: (e, t, n) => e.spawn(T(n[0]), T(n[1]), E(n[2]))?.id ?? -4,
    instance_destroy: (e, t, n) => {
        let r = n.length ? e.findInstance(E(n[0])) : t.self;
        r && e.destroy(r)
    }
    ,
    instance_exists: (e, t, n) => +(e.resolveAll(t, E(n[0])).length > 0),
    instance_number: (e, t, n) => e.resolveAll(t, E(n[0])).length,
    instance_find: (e, t, n) => e.resolveAll(t, E(n[0]))[E(n[1])]?.id ?? -4,
    instance_change: (e, t, n) => e.changeInstance(t.self, E(n[0]), D(n[1])),
    instance_position: (e, t, n) => e.findCollision(t, E(n[2]), !1, t => e.pointInside(t, T(n[0]), T(n[1]))),
    instance_place: (e, t, n) => e.placeCollision(t, T(n[0]), T(n[1]), E(n[2])),
    place_meeting: (e, t, n) => e.placeCollision(t, T(n[0]), T(n[1]), E(n[2])) === -4 ? 0 : 1,
    place_free: (e, t, n) => +(e.placeCollision(t, T(n[0]), T(n[1]), -3, !0) === -4),
    place_empty: (e, t, n) => +(e.placeCollision(t, T(n[0]), T(n[1]), -3) === -4),
    instance_activate_all: e => {
        for (let t of e.instances)
            t.active = !0
    }
    ,
    instance_activate_object: (e, t, n) => {
        for (let t of e.instances)
            (e.isA(t, E(n[0])) || t.id === E(n[0])) && (t.active = !0)
    }
    ,
    instance_deactivate_all: (e, t, n) => {
        for (let r of e.instances)
            D(n[0]) && r === t.self || (r.active = !1)
    }
    ,
    instance_deactivate_object: (e, t, n) => {
        for (let t of e.instances)
            (e.isA(t, E(n[0])) || t.id === E(n[0])) && (t.active = !1)
    }
    ,
    object_get_name: (e, t, n) => e.data.objects[E(n[0])]?.name ?? `<undefined>`,
    object_exists: (e, t, n) => +!!e.data.objects[E(n[0])],
    object_get_parent: (e, t, n) => e.data.objects[E(n[0])]?.parent ?? -1,
    object_is_ancestor: (e, t, n) => {
        let r = e.data.objects[E(n[0])]?.parent ?? -1;
        for (let t = 0; r >= 0 && t < 64; t++,
        r = e.data.objects[r].parent)
            if (r === E(n[1]))
                return 1;
        return 0
    }
    ,
    collision_point: (e, t, n) => e.findCollision(t, E(n[2]), D(n[4]), t => e.pointInside(t, T(n[0]), T(n[1]), D(n[3]))),
    collision_rectangle: (e, t, n) => {
        let r = Math.min(T(n[0]), T(n[2]))
          , i = Math.min(T(n[1]), T(n[3]))
          , a = Math.max(T(n[0]), T(n[2]))
          , o = Math.max(T(n[1]), T(n[3]));
        return e.findCollision(t, E(n[4]), D(n[6]), t => e.rectOverlaps(t, r, i, a, o, D(n[5])))
    }
    ,
    collision_circle: (e, t, n) => {
        let r = T(n[0])
          , i = T(n[1])
          , a = T(n[2]);
        return e.findCollision(t, E(n[3]), D(n[5]), t => {
            let n = e.bounds(t);
            if (!n)
                return !1;
            let o = Math.max(n.left - r, 0, r - n.right)
              , s = Math.max(n.top - i, 0, i - n.bottom);
            return o * o + s * s <= a * a
        }
        )
    }
    ,
    collision_line: (e, t, n) => {
        let[r,i,a,o] = [T(n[0]), T(n[1]), T(n[2]), T(n[3])]
          , s = Math.max(1, Math.ceil(Math.hypot(a - r, o - i)));
        return e.findCollision(t, E(n[4]), D(n[6]), t => {
            for (let c = 0; c <= s; c++)
                if (e.pointInside(t, r + (a - r) * c / s, i + (o - i) * c / s, D(n[5])))
                    return !0;
            return !1
        }
        )
    }
    ,
    distance_to_point: (e, t, n) => Bt(e, t.self, T(n[0]), T(n[1])),
    distance_to_object: (e, t, n) => {
        let r = 1e6
          , i = e.bounds(t.self);
        for (let a of e.resolveAll(t, E(n[0]))) {
            if (a === t.self)
                continue;
            let n = e.bounds(a);
            if (!i || !n) {
                r = Math.min(r, Math.hypot(a.x - t.self.x, a.y - t.self.y));
                continue
            }
            let o = Math.max(n.left - i.right, 0, i.left - n.right)
              , s = Math.max(n.top - i.bottom, 0, i.top - n.bottom);
            r = Math.min(r, Math.hypot(o, s))
        }
        return r
    }
    ,
    move_snap: (e, t, n) => {
        let r = T(n[0])
          , i = T(n[1]);
        r > 0 && (t.self.x = Tt(t.self.x / r) * r),
        i > 0 && (t.self.y = Tt(t.self.y / i) * i)
    }
    ,
    move_towards_point: (e, t, n) => {
        let r = Math.atan2(-(T(n[1]) - t.self.y), T(n[0]) - t.self.x) / k;
        t.self.setMotion(r, T(n[2]))
    }
    ,
    motion_set: (e, t, n) => t.self.setMotion(T(n[0]), T(n[1])),
    path_start: (e, t, n) => {
        let r = t.self
          , i = e.data.paths[E(n[0])];
        i && i.points.length !== 0 && (r.path = i.index,
        r.pathSpeed = T(n[1]),
        r.pathEndAction = E(n[2]),
        r.pathPosition = +(r.pathSpeed < 0),
        r.pathOrigin = D(n[3]) ? {
            x: 0,
            y: 0
        } : {
            x: r.x - i.points[0].x,
            y: r.y - i.points[0].y
        })
    }
    ,
    path_end: (e, t) => {
        t.self.path = -1
    }
    ,
    event_inherited: (e, t) => e.runInherited(t),
    event_perform: (e, t, n) => {
        e.runEvent(t.self, E(n[0]), E(n[1]), t.other)
    }
    ,
    event_user: (e, t, n) => {
        e.runEvent(t.self, K.OTHER, q.USER0 + E(n[0]), t.other)
    }
    ,
    script_execute: (e, t, n) => {
        let r = e.data.scriptNames[E(n[0])]
          , i = r === void 0 ? void 0 : e.data.scripts.get(r);
        return i === void 0 ? 0 : e.callScript(t, i, n.slice(1))
    }
    ,
    script_exists: (e, t, n) => e.data.scriptNames[E(n[0])] === void 0 ? 0 : 1,
    room_goto: (e, t, n) => e.gotoRoom(E(n[0])),
    room_goto_next: e => e.gotoRoom(e.data.roomOrder[e.data.roomOrder.indexOf(e.roomIndex) + 1] ?? -1),
    room_goto_previous: e => e.gotoRoom(e.data.roomOrder[e.data.roomOrder.indexOf(e.roomIndex) - 1] ?? -1),
    room_next: (e, t, n) => e.data.roomOrder[e.data.roomOrder.indexOf(E(n[0])) + 1] ?? -1,
    room_previous: (e, t, n) => e.data.roomOrder[e.data.roomOrder.indexOf(E(n[0])) - 1] ?? -1,
    room_restart: e => e.gotoRoom(e.roomIndex),
    room_get_name: (e, t, n) => e.data.roomNames[E(n[0])] ?? `<undefined>`,
    room_exists: (e, t, n) => +!!e.data.rooms[E(n[0])],
    room_set_persistent: (e, t, n) => {
        E(n[0]) === e.roomIndex && (e.roomPersistent = D(n[1]));
        let r = e.data.rooms[E(n[0])];
        r && (r.persistent = D(n[1]))
    }
    ,
    game_end: e => e.end(),
    game_restart: e => e.restart(),
    keyboard_check: (e, t, n) => +!!e.input.isDown(E(n[0])),
    keyboard_check_direct: (e, t, n) => +!!e.input.isDown(E(n[0])),
    keyboard_check_pressed: (e, t, n) => +!!e.input.wasPressed(E(n[0])),
    keyboard_check_released: (e, t, n) => +!!e.input.wasReleased(E(n[0])),
    keyboard_clear: (e, t, n) => e.input.clear(E(n[0])),
    keyboard_key_press: (e, t, n) => e.input.press(E(n[0])),
    keyboard_key_release: (e, t, n) => e.input.release(E(n[0])),
    joystick_exists: () => 0,
    joystick_buttons: () => 0,
    joystick_check_button: () => 0,
    joystick_direction: () => 101,
    joystick_has_pov: () => 0,
    joystick_pov: () => -1,
    joystick_xpos: () => 0,
    joystick_ypos: () => 0,
    gamepad_is_connected: (e, t, n) => +!!Ut(E(n[0])),
    gamepad_get_device_count: () => navigator.getGamepads?.().length ?? 0,
    gamepad_button_check: (e, t, n) => +!!Ut(E(n[0]))?.buttons[Vt[E(n[1])] ?? -1]?.pressed,
    gamepad_axis_value: (e, t, n) => Ut(E(n[0]))?.axes[Ht[E(n[1])] ?? -1] ?? 0,
    audio_play_sound: (e, t, n) => e.audio.play(E(n[0]), D(n[2])),
    audio_stop_sound: (e, t, n) => e.audio.stop(E(n[0])),
    audio_stop_all: e => e.audio.stopAll(),
    audio_pause_sound: (e, t, n) => e.audio.pause(E(n[0])),
    audio_resume_sound: (e, t, n) => e.audio.resumeSound(E(n[0])),
    audio_pause_all: e => e.audio.pauseAll(),
    audio_resume_all: e => e.audio.resumeAll(),
    audio_is_playing: (e, t, n) => +!!e.audio.isPlaying(E(n[0])),
    audio_sound_gain: (e, t, n) => e.audio.setGain(E(n[0]), T(n[1]), T(n[2])),
    audio_sound_get_gain: (e, t, n) => e.audio.getGain(E(n[0])),
    audio_sound_pitch: (e, t, n) => e.audio.setPitch(E(n[0]), T(n[1])),
    audio_sound_get_pitch: (e, t, n) => e.audio.getPitch(E(n[0])),
    audio_sound_get_track_position: (e, t, n) => e.audio.getPosition(E(n[0])),
    audio_sound_set_track_position: (e, t, n) => e.audio.setPosition(E(n[0]), T(n[1])),
    audio_channel_num: () => 0,
    audio_exists: (e, t, n) => +!!e.data.sounds[E(n[0])],
    file_exists: (e, t, n) => +!!e.files.exists(O(n[0])),
    file_delete: (e, t, n) => e.files.delete(O(n[0])),
    file_rename: (e, t, n) => e.files.rename(O(n[0]), O(n[1])),
    file_text_open_read: (e, t, n) => e.files.textOpen(O(n[0]), !1),
    file_text_open_write: (e, t, n) => e.files.textOpen(O(n[0]), !0),
    file_text_close: (e, t, n) => e.files.textClose(E(n[0])),
    file_text_read_real: (e, t, n) => e.files.textReadReal(E(n[0])),
    file_text_read_string: (e, t, n) => e.files.textReadString(E(n[0])),
    file_text_readln: (e, t, n) => e.files.textReadln(E(n[0])),
    file_text_eof: (e, t, n) => +!!e.files.textEof(E(n[0])),
    file_text_write_real: (e, t, n) => e.files.textWrite(E(n[0]), ` ${St(T(n[1])) === String(Math.trunc(T(n[1]))) ? Math.trunc(T(n[1])) : T(n[1]).toFixed(6).replace(/0+$/, ``).replace(/\.$/, ``)}`),
    file_text_write_string: (e, t, n) => e.files.textWrite(E(n[0]), O(n[1])),
    file_text_writeln: (e, t, n) => e.files.textWrite(E(n[0]), `\r
`),
    ini_open: (e, t, n) => e.files.iniOpen(O(n[0])),
    ini_open_from_string: (e, t, n) => e.files.iniOpenFromString(O(n[0])),
    ini_close: e => e.files.iniClose(),
    ini_section_exists: (e, t, n) => +!!e.files.iniSectionExists(O(n[0])),
    ini_read_string: (e, t, n) => e.files.iniRead(O(n[0]), O(n[1])) ?? O(n[2]),
    ini_read_real: (e, t, n) => {
        let r = e.files.iniRead(O(n[0]), O(n[1]))
          , i = r === void 0 ? NaN : Number(r);
        return Number.isFinite(i) ? i : T(n[2])
    }
    ,
    ini_write_string: (e, t, n) => e.files.iniWrite(O(n[0]), O(n[1]), O(n[2])),
    ini_write_real: (e, t, n) => e.files.iniWrite(O(n[0]), O(n[1]), T(n[2]).toFixed(6)),
    ini_key_exists: (e, t, n) => e.files.iniRead(O(n[0]), O(n[1])) === void 0 ? 0 : 1,
    ds_map_create: e => {
        let t = e.nextDsMap++;
        return e.dsMaps.set(t, new Map),
        t
    }
    ,
    ds_map_destroy: (e, t, n) => void e.dsMaps.delete(E(n[0])),
    ds_map_exists: (e, t, n) => +!!P(e, n[0])?.has(F(n[1])),
    ds_map_add: (e, t, n) => {
        let r = P(e, n[0]);
        r && !r.has(F(n[1])) && r.set(F(n[1]), n[2])
    }
    ,
    ds_map_set: (e, t, n) => void P(e, n[0])?.set(F(n[1]), n[2]),
    ds_map_set_post: (e, t, n) => void P(e, n[0])?.set(F(n[1]), n[2]),
    ds_map_replace: (e, t, n) => void P(e, n[0])?.set(F(n[1]), n[2]),
    ds_map_find_value: (e, t, n) => P(e, n[0])?.get(F(n[1])),
    ds_map_delete: (e, t, n) => void P(e, n[0])?.delete(F(n[1])),
    ds_map_size: (e, t, n) => P(e, n[0])?.size ?? 0,
    ds_map_clear: (e, t, n) => P(e, n[0])?.clear(),
    json_encode: (e, t, n) => JSON.stringify(Object.fromEntries(P(e, n[0]) ?? [])),
    json_decode: (e, t, n) => {
        let r = e.nextDsMap++
          , i = new Map;
        try {
            let e = JSON.parse(O(n[0]));
            if (e && typeof e == `object`)
                for (let[t,n] of Object.entries(e))
                    i.set(t, typeof n == `number` || typeof n == `string` ? n : void 0)
        } catch {
            return -1
        }
        return e.dsMaps.set(r, i),
        r
    }
    ,
    buffer_create: () => -1,
    buffer_delete: () => 0,
    buffer_write: () => 0,
    buffer_read: () => 0,
    buffer_get_size: () => 0,
    buffer_save_async: () => -1,
    buffer_load_async: () => -1,
    buffer_async_group_begin: () => 0,
    buffer_async_group_end: () => -1,
    buffer_async_group_option: () => 0,
    steam_initialised: () => 0,
    steam_file_exists: () => 0,
    steam_file_delete: () => 0,
    steam_file_write_file: () => 0,
    os_get_language: () => `en`,
    os_get_region: () => ``,
    os_is_paused: () => 0,
    window_get_width: e => e.renderer.width,
    window_get_height: e => e.renderer.height,
    window_get_x: () => 0,
    window_get_y: () => 0,
    window_get_fullscreen: () => +!!document.fullscreenElement,
    window_set_fullscreen: (e, t, n) => {
        D(n[0]) && !document.fullscreenElement ? document.documentElement.requestFullscreen().catch( () => void 0) : !D(n[0]) && document.fullscreenElement && document.exitFullscreen().catch( () => void 0)
    }
    ,
    window_set_caption: () => 0,
    window_set_position: () => 0,
    window_set_size: () => 0,
    window_center: () => 0,
    display_get_width: () => screen.width,
    display_get_height: () => screen.height,
    date_current_datetime: () => Rt(),
    get_timer: e => Math.floor(e.elapsedMs() * 1e3),
    get_string_async: () => -1,
    variable_global_exists: (e, t, n) => +!!e.globals.has(O(n[0])),
    variable_global_get: (e, t, n) => e.globals.get(O(n[0])),
    variable_global_set: (e, t, n) => void e.globals.set(O(n[0]), n[1]),
    extension_stubfunc_real: () => 0,
    show_debug_message: (e, t, n) => void console.debug(`[game]`, O(n[0])),
    show_message: (e, t, n) => void console.info(`[game message]`, O(n[0])),
    action_set_relative: (e, t, n) => void (e.actionRelative = D(n[0])),
    action_create_object: (e, t, n) => {
        e.spawn(I(e, t.self.x, T(n[1])), I(e, t.self.y, T(n[2])), E(n[0]))
    }
    ,
    action_kill_object: (e, t) => e.destroy(t.self),
    action_move_to: (e, t, n) => {
        t.self.x = I(e, t.self.x, T(n[0])),
        t.self.y = I(e, t.self.y, T(n[1]))
    }
    ,
    action_move_point: (e, t, n) => {
        let r = Math.atan2(-(T(n[1]) - t.self.y), T(n[0]) - t.self.x) / k;
        t.self.setMotion(r, T(n[2]))
    }
    ,
    action_move: (e, t, n) => {
        let r = O(n[0])
          , i = [225, 270, 315, 180, -1, 0, 135, 90, 45].filter( (e, t) => r[t] === `1`)
          , a = i[Math.floor(e.random() * i.length)];
        a !== void 0 && (a < 0 ? t.self.setMotion(0, 0) : t.self.setMotion(a, I(e, t.self.speed, T(n[1]))))
    }
    ,
    action_set_motion: (e, t, n) => {
        if (e.actionRelative) {
            let e = T(n[0]) * k;
            t.self.hspeed += Math.cos(e) * T(n[1]),
            t.self.vspeed -= Math.sin(e) * T(n[1])
        } else
            t.self.setMotion(T(n[0]), T(n[1]))
    }
    ,
    action_set_hspeed: (e, t, n) => void (t.self.hspeed = I(e, t.self.hspeed, T(n[0]))),
    action_set_vspeed: (e, t, n) => void (t.self.vspeed = I(e, t.self.vspeed, T(n[0]))),
    action_set_friction: (e, t, n) => void (t.self.friction = I(e, t.self.friction, T(n[0]))),
    action_set_gravity: (e, t, n) => {
        t.self.gravityDirection = T(n[0]),
        t.self.gravity = I(e, t.self.gravity, T(n[1]))
    }
    ,
    action_set_alarm: (e, t, n) => {
        let r = E(n[1]);
        r >= 0 && r < t.self.alarm.length && (t.self.alarm[r] = I(e, t.self.alarm[r], T(n[0])))
    }
    ,
    action_previous_room: e => Wt.room_goto_previous(e, e.dummyFrame(), []),
    action_next_room: e => Wt.room_goto_next(e, e.dummyFrame(), [])
}
  , L = e => ({
    get: t => t[e],
    set: (t, n) => {
        t[e] = C(n)
    }
})
  , Gt = e => ({
    get: t => +!!t[e],
    set: (t, n) => {
        t[e] = S(n)
    }
})
  , R = e => ({
    get: e
});
function Kt(e, t) {
    return t.data.spriteList[e.sprite]
}
var qt = {
    x: L(`x`),
    y: L(`y`),
    xprevious: L(`xprevious`),
    yprevious: L(`yprevious`),
    xstart: L(`xstart`),
    ystart: L(`ystart`),
    hspeed: L(`hspeed`),
    vspeed: L(`vspeed`),
    speed: L(`speed`),
    direction: L(`direction`),
    friction: L(`friction`),
    gravity: L(`gravity`),
    gravity_direction: L(`gravityDirection`),
    sprite_index: L(`sprite`),
    mask_index: L(`mask`),
    image_index: L(`imageIndex`),
    image_speed: L(`imageSpeed`),
    image_xscale: L(`imageXscale`),
    image_yscale: L(`imageYscale`),
    image_angle: L(`imageAngle`),
    image_alpha: L(`imageAlpha`),
    image_blend: L(`imageBlend`),
    image_single: {
        get: e => e.imageSpeed === 0 ? e.imageIndex : -1,
        set: (e, t) => {
            let n = C(t);
            n >= 0 ? (e.imageSpeed = 0,
            e.imageIndex = n) : e.imageSpeed = 1
        }
    },
    image_number: R( (e, t) => Kt(e, t)?.frames.length ?? 0),
    sprite_width: R( (e, t) => (Kt(e, t)?.width ?? 0) * e.imageXscale),
    sprite_height: R( (e, t) => (Kt(e, t)?.height ?? 0) * e.imageYscale),
    sprite_xoffset: R( (e, t) => (Kt(e, t)?.originX ?? 0) * e.imageXscale),
    sprite_yoffset: R( (e, t) => (Kt(e, t)?.originY ?? 0) * e.imageYscale),
    depth: L(`depth`),
    visible: Gt(`visible`),
    solid: Gt(`solid`),
    persistent: Gt(`persistent`),
    object_index: R(e => e.object.index),
    id: R(e => e.id),
    alarm: {
        get: (e, t, n) => e.alarm[n ?? 0] ?? -1,
        set: (e, t, n, r) => {
            let i = r ?? 0;
            i >= 0 && i < e.alarm.length && (e.alarm[i] = C(t))
        }
    },
    bbox_left: R( (e, t) => Math.round(t.bounds(e)?.left ?? e.x)),
    bbox_top: R( (e, t) => Math.round(t.bounds(e)?.top ?? e.y)),
    bbox_right: R( (e, t) => Math.round(t.bounds(e)?.right ?? e.x + 1) - 1),
    bbox_bottom: R( (e, t) => Math.round(t.bounds(e)?.bottom ?? e.y + 1) - 1),
    path_index: R(e => e.path),
    path_position: L(`pathPosition`),
    path_positionprevious: R(e => e.pathPosition),
    path_speed: L(`pathSpeed`),
    path_endaction: L(`pathEndAction`),
    path_scale: R( () => 1),
    path_orientation: R( () => 0),
    timeline_index: R( () => -1)
}
  , z = e => ({
    get: (t, n, r) => {
        let i = t.views[r ?? 0]?.[e] ?? 0;
        return typeof i == `boolean` ? +!!i : i
    }
    ,
    set: (t, n, r, i) => {
        let a = t.views[i ?? 0];
        a && (e === `visible` ? a.visible = S(r) : a[e] = C(r))
    }
})
  , B = e => ({
    get: (t, n, r) => {
        let i = t.backgrounds[r ?? 0]?.[e] ?? 0;
        return typeof i == `boolean` ? +!!i : i
    }
    ,
    set: (t, n, r, i) => {
        let a = t.backgrounds[i ?? 0];
        a && (a[e] = e === `visible` || e === `foreground` || e === `tileX` || e === `tileY` ? S(r) : C(r))
    }
})
  , V = e => {
    let t = new WeakMap;
    return {
        get: n => t.has(n) ? t.get(n) : e,
        set: (e, n, r) => {
            t.set(e, r)
        }
    }
}
  , H = e => ({
    get: () => e
})
  , U = e => ({
    get: () => e(new Date)
})
  , Jt = {
    room: {
        get: e => e.roomIndex,
        set: (e, t, n) => e.gotoRoom(w(n))
    },
    room_speed: {
        get: e => e.roomSpeed,
        set: (e, t, n) => {
            e.roomSpeed = Math.max(1, C(n))
        }
    },
    room_width: {
        get: e => e.roomWidth,
        set: (e, t, n) => void (e.roomWidth = C(n))
    },
    room_height: {
        get: e => e.roomHeight,
        set: (e, t, n) => void (e.roomHeight = C(n))
    },
    room_persistent: {
        get: e => +!!e.roomPersistent,
        set: (e, t, n) => void (e.roomPersistent = S(n))
    },
    room_first: {
        get: e => e.data.roomOrder[0]
    },
    room_last: {
        get: e => e.data.roomOrder[e.data.roomOrder.length - 1]
    },
    room_caption: V(``),
    transition_kind: V(0),
    transition_steps: V(80),
    view_enabled: {
        get: e => +!!e.viewsEnabled,
        set: (e, t, n) => void (e.viewsEnabled = S(n))
    },
    view_current: {
        get: e => e.viewCurrent
    },
    view_visible: z(`visible`),
    view_xview: z(`x`),
    view_yview: z(`y`),
    view_wview: z(`w`),
    view_hview: z(`h`),
    view_xport: z(`portX`),
    view_yport: z(`portY`),
    view_wport: z(`portW`),
    view_hport: z(`portH`),
    view_angle: z(`angle`),
    view_hborder: z(`borderX`),
    view_vborder: z(`borderY`),
    view_hspeed: z(`speedX`),
    view_vspeed: z(`speedY`),
    view_object: z(`object`),
    background_color: {
        get: e => e.backgroundColor,
        set: (e, t, n) => void (e.backgroundColor = w(n))
    },
    background_colour: {
        get: e => e.backgroundColor,
        set: (e, t, n) => void (e.backgroundColor = w(n))
    },
    background_showcolor: {
        get: e => +!!e.showBackgroundColor,
        set: (e, t, n) => void (e.showBackgroundColor = S(n))
    },
    background_showcolour: {
        get: e => +!!e.showBackgroundColor,
        set: (e, t, n) => void (e.showBackgroundColor = S(n))
    },
    background_visible: B(`visible`),
    background_foreground: B(`foreground`),
    background_index: B(`index`),
    background_x: B(`x`),
    background_y: B(`y`),
    background_htiled: B(`tileX`),
    background_vtiled: B(`tileY`),
    background_xscale: B(`xscale`),
    background_yscale: B(`yscale`),
    background_hspeed: B(`hspeed`),
    background_vspeed: B(`vspeed`),
    background_blend: B(`blend`),
    background_alpha: B(`alpha`),
    background_width: {
        get: (e, t, n) => e.data.backgrounds[e.backgrounds[n ?? 0]?.index ?? -1]?.item?.boundingWidth ?? 0
    },
    background_height: {
        get: (e, t, n) => e.data.backgrounds[e.backgrounds[n ?? 0]?.index ?? -1]?.item?.boundingHeight ?? 0
    },
    keyboard_key: {
        get: e => e.input.currentKey,
        set: (e, t, n) => void (e.input.currentKey = w(n))
    },
    keyboard_lastkey: {
        get: e => e.input.lastKey,
        set: (e, t, n) => void (e.input.lastKey = w(n))
    },
    keyboard_lastchar: {
        get: e => e.input.lastChar,
        set: (e, t, n) => void (e.input.lastChar = String(n ?? ``))
    },
    keyboard_string: {
        get: e => e.input.keyboardString,
        set: (e, t, n) => void (e.input.keyboardString = String(n ?? ``))
    },
    mouse_x: H(0),
    mouse_y: H(0),
    mouse_button: H(0),
    current_time: {
        get: e => Math.floor(e.elapsedMs())
    },
    current_year: U(e => e.getFullYear()),
    current_month: U(e => e.getMonth() + 1),
    current_day: U(e => e.getDate()),
    current_weekday: U(e => e.getDay()),
    current_hour: U(e => e.getHours()),
    current_minute: U(e => e.getMinutes()),
    current_second: U(e => e.getSeconds()),
    fps: {
        get: e => e.roomSpeed
    },
    fps_real: {
        get: e => e.roomSpeed
    },
    delta_time: {
        get: e => 1e6 / e.roomSpeed
    },
    instance_count: {
        get: e => e.instances.filter(e => e.active && !e.destroyed).length
    },
    health: V(100),
    lives: V(-1),
    score: V(0),
    application_surface: {
        get: e => e.appSurfaceId
    },
    os_type: H(0),
    os_device: H(0),
    os_browser: H(-1),
    os_version: H(0),
    working_directory: H(``),
    program_directory: H(``),
    temp_directory: H(``),
    game_id: H(0),
    game_display_name: {
        get: e => e.data.displayName
    },
    debug_mode: H(0),
    secure_mode: H(0),
    cursor_sprite: V(-1),
    browser_width: H(640),
    browser_height: H(480),
    event_type: {
        get: (e, t) => t.event?.type ?? -1
    },
    event_number: {
        get: (e, t) => t.event?.subtype ?? -1
    },
    event_object: {
        get: (e, t) => t.event?.owner ?? -1
    }
}
  , Yt = class {
    id;
    object;
    vars = new Map;
    alarm = Array(12).fill(-1);
    x = 0;
    y = 0;
    xstart = 0;
    ystart = 0;
    xprevious = 0;
    yprevious = 0;
    hspeed = 0;
    vspeed = 0;
    friction = 0;
    gravity = 0;
    gravityDirection = 270;
    sprite = -1;
    mask = -1;
    imageIndex = 0;
    imageSpeed = 1;
    imageXscale = 1;
    imageYscale = 1;
    imageAngle = 0;
    imageAlpha = 1;
    imageBlend = 16777215;
    depth = 0;
    visible = !0;
    solid = !1;
    persistent = !1;
    path = -1;
    pathSpeed = 0;
    pathPosition = 0;
    pathEndAction = 0;
    pathOrigin = {
        x: 0,
        y: 0
    };
    destroyed = !1;
    active = !0;
    order;
    constructor(e, t, n, r, i) {
        this.id = e,
        this.object = t,
        this.order = i,
        this.x = this.xstart = this.xprevious = n,
        this.y = this.ystart = this.yprevious = r,
        this.sprite = t.sprite,
        this.mask = t.mask,
        this.depth = t.depth,
        this.visible = t.visible,
        this.solid = t.solid,
        this.persistent = t.persistent
    }
    get speed() {
        return Math.hypot(this.hspeed, this.vspeed)
    }
    set speed(e) {
        let t = this.direction;
        this.setMotion(t, e)
    }
    get direction() {
        if (this.hspeed === 0 && this.vspeed === 0)
            return this.lastDirection;
        let e = Math.atan2(-this.vspeed, this.hspeed) * 180 / Math.PI;
        return e < 0 ? e + 360 : e
    }
    set direction(e) {
        this.lastDirection = (e % 360 + 360) % 360,
        this.setMotion(this.lastDirection, this.speed)
    }
    lastDirection = 0;
    setMotion(e, t) {
        this.lastDirection = (e % 360 + 360) % 360;
        let n = e * Math.PI / 180;
        this.hspeed = Math.cos(n) * t,
        this.vspeed = -Math.sin(n) * t,
        Math.abs(this.hspeed) < 1e-10 && (this.hspeed = 0),
        Math.abs(this.vspeed) < 1e-10 && (this.vspeed = 0)
    }
}
  , W = {
    Conv: 7,
    Mul: 8,
    Div: 9,
    Rem: 10,
    Mod: 11,
    Add: 12,
    Sub: 13,
    And: 14,
    Or: 15,
    Xor: 16,
    Neg: 17,
    Not: 18,
    Shl: 19,
    Shr: 20,
    Cmp: 21,
    Pop: 69,
    PushI: 132,
    Dup: 134,
    Ret: 156,
    Exit: 157,
    Popz: 158,
    B: 182,
    Bt: 183,
    Bf: 184,
    PushEnv: 186,
    PopEnv: 187,
    Push: 192,
    PushLoc: 193,
    PushGlb: 194,
    PushBltn: 195,
    Call: 217,
    Break: 255
}
  , G = {
    Double: 0,
    Float: 1,
    Int32: 2,
    Int64: 3,
    Boolean: 4,
    Variable: 5,
    String: 6,
    Int16: 15
}
  , Xt = {
    LT: 1,
    LTE: 2,
    EQ: 3,
    NEQ: 4,
    GTE: 5,
    GT: 6
}
  , Zt = {
    Array: 0,
    StackTop: 128,
    Normal: 160,
    Instance: 224
};
function Qt(e, t) {
    let n = e.reader
      , r = t.start + t.length
      , i = []
      , a = new Map
      , o = [];
    for (let s = t.start; s < r; ) {
        a.set(s, i.length);
        let r = n.u32(s)
          , c = r >>> 24
          , l = r & 255
          , u = r >>> 8 & 255
          , d = r >>> 16 & 255
          , f = r & 65535
          , p = {
            op: c,
            type1: d & 15,
            type2: d >> 4,
            extra: l,
            target: -1,
            value: 0,
            variable: null,
            varKind: 0,
            instance: 0,
            func: ``,
            drop: !1
        }
          , m = 4;
        switch (c) {
        case W.Cmp:
            p.extra = u;
            break;
        case W.B:
        case W.Bt:
        case W.Bf:
        case W.PushEnv:
        case W.PopEnv:
            {
                let e = r & 16777215;
                if (c === W.PopEnv && e === 15728640)
                    p.drop = !0;
                else {
                    let t = e & 4194304 ? (e & 8388607) - 8388608 : e & 8388607;
                    o.push({
                        index: i.length,
                        address: s,
                        offset: t
                    })
                }
                break
            }
        case W.Pop:
            p.instance = f << 16 >> 16,
            p.variable = e.variableRefs.get(s) ?? null,
            p.varKind = n.u32(s + 4) >>> 24 & 248,
            m = 8;
            break;
        case W.PushI:
            p.value = f << 16 >> 16;
            break;
        case W.Push:
        case W.PushLoc:
        case W.PushGlb:
        case W.PushBltn:
            switch (p.type1) {
            case G.Int16:
                p.value = f << 16 >> 16;
                break;
            case G.Variable:
                p.instance = f << 16 >> 16,
                p.variable = e.variableRefs.get(s) ?? null,
                p.varKind = n.u32(s + 4) >>> 24 & 248,
                m = 8;
                break;
            case G.Double:
                p.value = n.view.getFloat64(s + 4, !0),
                m = 12;
                break;
            case G.Float:
                p.value = n.f32(s + 4),
                m = 8;
                break;
            case G.Int32:
                p.value = n.i32(s + 4),
                m = 8;
                break;
            case G.Int64:
                p.value = Number(n.view.getBigInt64(s + 4, !0)),
                m = 12;
                break;
            case G.Boolean:
                p.value = n.u32(s + 4) !== 0,
                m = 8;
                break;
            case G.String:
                p.value = e.strings[n.u32(s + 4)] ?? ``,
                m = 8;
                break;
            default:
                throw Error(`${t.name}: push of unknown type ${p.type1} at ${s}`)
            }
            break;
        case W.Call:
            p.extra = f,
            p.func = e.functionRefs.get(s) ?? ``,
            m = 8;
            break;
        case W.Break:
            p.value = f << 16 >> 16;
            break;
        case W.Dup:
        case W.Conv:
        case W.Mul:
        case W.Div:
        case W.Rem:
        case W.Mod:
        case W.Add:
        case W.Sub:
        case W.And:
        case W.Or:
        case W.Xor:
        case W.Neg:
        case W.Not:
        case W.Shl:
        case W.Shr:
        case W.Ret:
        case W.Exit:
        case W.Popz:
            break;
        default:
            throw Error(`${t.name}: unknown opcode 0x${c.toString(16)} at ${s}`)
        }
        i.push(p),
        s += m
    }
    a.set(r, i.length);
    for (let {index: e, address: n, offset: r} of o) {
        let o = a.get(n + r * 4);
        if (o === void 0)
            throw Error(`${t.name}: branch into the middle of an instruction at ${n}`);
        i[e].target = o
    }
    return {
        entry: t,
        instructions: i
    }
}
var $t = 5e7
  , en = class {
    data;
    host;
    cache = new Map;
    depth = 0;
    constructor(e, t) {
        this.data = e,
        this.host = t
    }
    run(e, t) {
        let n = this.cache.get(e);
        if (n || (n = Qt(this.data, this.data.code[e]),
        this.cache.set(e, n)),
        ++this.depth > 512)
            throw this.depth = 0,
            Error(`call depth exceeded in ${n.entry.name}`);
        try {
            return this.execute(n, t)
        } finally {
            this.depth--
        }
    }
    execute(e, t) {
        let n = e.instructions
          , r = this.host
          , i = []
          , a = []
          , o = 0
          , s = $t
          , c = () => i.pop();
        for (; o < n.length; ) {
            if (--s === 0)
                throw Error(`${e.entry.name}: instruction budget exceeded (infinite loop?)`);
            let l = n[o++];
            switch (l.op) {
            case W.Push:
            case W.PushLoc:
            case W.PushGlb:
            case W.PushBltn:
                if (l.type1 === G.Variable) {
                    let e = l.variable.name;
                    if (l.varKind === Zt.Array) {
                        let n = w(c());
                        i.push(r.getVar(t, c(), e, n))
                    } else
                        l.varKind === Zt.StackTop ? i.push(r.getVar(t, c(), e)) : i.push(r.getVar(t, l.instance, e))
                } else
                    i.push(typeof l.value == `boolean` ? +!!l.value : l.value);
                break;
            case W.PushI:
                i.push(l.value);
                break;
            case W.Pop:
                {
                    let e = l.type1 === G.Int32, n = e ? c() : void 0, i = l.instance, a;
                    l.varKind === Zt.Array ? (a = w(c()),
                    i = c()) : l.varKind === Zt.StackTop && (i = c()),
                    e || (n = c()),
                    r.setVar(t, i, l.variable.name, n, a);
                    break
                }
            case W.Popz:
                c();
                break;
            case W.Dup:
                {
                    let e = l.extra + 1;
                    i.push(...i.slice(i.length - e));
                    break
                }
            case W.Conv:
                {
                    let e = c();
                    l.type2 === G.Boolean ? i.push(+!!S(e)) : l.type2 === G.Int32 || l.type2 === G.Int64 ? i.push(typeof e == `number` ? Math.trunc(e) : e) : i.push(e);
                    break
                }
            case W.Add:
                {
                    let e = c()
                      , t = c();
                    typeof t == `string` || typeof e == `string` ? i.push(`${typeof t == `string` ? t : ``}${typeof e == `string` ? e : ``}`) : i.push(C(t) + C(e));
                    break
                }
            case W.Sub:
                {
                    let e = C(c());
                    i.push(C(c()) - e);
                    break
                }
            case W.Mul:
                {
                    let e = c()
                      , t = c();
                    typeof t == `string` ? i.push(t.repeat(Math.max(0, w(e)))) : i.push(C(t) * C(e));
                    break
                }
            case W.Div:
                {
                    let e = C(c());
                    i.push(C(c()) / e);
                    break
                }
            case W.Rem:
                {
                    let e = C(c());
                    i.push(Math.trunc(C(c()) / e));
                    break
                }
            case W.Mod:
                {
                    let e = C(c());
                    i.push(C(c()) % e);
                    break
                }
            case W.And:
            case W.Or:
            case W.Xor:
                {
                    let e = c()
                      , t = c();
                    if (l.type1 === G.Boolean && l.type2 === G.Boolean) {
                        let n = S(t)
                          , r = S(e);
                        i.push((l.op === W.And ? n && r : l.op === W.Or ? n || r : n !== r) ? 1 : 0)
                    } else {
                        let n = w(t)
                          , r = w(e);
                        i.push(l.op === W.And ? n & r : l.op === W.Or ? n | r : n ^ r)
                    }
                    break
                }
            case W.Shl:
                {
                    let e = w(c());
                    i.push(w(c()) * 2 ** e);
                    break
                }
            case W.Shr:
                {
                    let e = w(c());
                    i.push(Math.floor(w(c()) / 2 ** e));
                    break
                }
            case W.Neg:
                i.push(-C(c()));
                break;
            case W.Not:
                l.type1 === G.Boolean ? i.push(+!S(c())) : i.push(~w(c()));
                break;
            case W.Cmp:
                {
                    let e = c(), t = c(), n = typeof t == typeof e || typeof t != `string` && typeof e != `string`, r = wt(t, e), a;
                    switch (l.extra) {
                    case Xt.LT:
                        a = n && r < 0;
                        break;
                    case Xt.LTE:
                        a = n && r <= 0;
                        break;
                    case Xt.EQ:
                        a = n && r === 0;
                        break;
                    case Xt.NEQ:
                        a = !n || r !== 0;
                        break;
                    case Xt.GTE:
                        a = n && r >= 0;
                        break;
                    default:
                        a = n && r > 0
                    }
                    i.push(+!!a);
                    break
                }
            case W.B:
                o = l.target;
                break;
            case W.Bt:
                S(c()) && (o = l.target);
                break;
            case W.Bf:
                S(c()) || (o = l.target);
                break;
            case W.PushEnv:
                {
                    let e = r.withTargets(t, c());
                    if (e.length === 0) {
                        n[l.target]?.op === W.PopEnv && a.push({
                            instances: e,
                            index: 0,
                            self: t.self,
                            other: t.other
                        }),
                        o = l.target;
                        break
                    }
                    a.push({
                        instances: e,
                        index: 0,
                        self: t.self,
                        other: t.other
                    }),
                    t.other = t.self,
                    t.self = e[0];
                    break
                }
            case W.PopEnv:
                {
                    let e = a[a.length - 1];
                    if (!e)
                        break;
                    if (!l.drop) {
                        let n = e.index + 1;
                        for (; n < e.instances.length && e.instances[n].destroyed; )
                            n++;
                        if (n < e.instances.length) {
                            e.index = n,
                            t.self = e.instances[n],
                            o = l.target;
                            break
                        }
                    }
                    a.pop(),
                    t.self = e.self,
                    t.other = e.other;
                    break
                }
            case W.Call:
                {
                    let e = [];
                    for (let t = 0; t < l.extra; t++)
                        e.push(c());
                    i.push(r.call(t, l.func, e));
                    break
                }
            case W.Ret:
                {
                    let e = c();
                    return this.unwind(a, t),
                    e
                }
            case W.Exit:
                this.unwind(a, t);
                return;
            case W.Break:
                break;
            default:
                throw Error(`${e.entry.name}: unhandled opcode 0x${l.op.toString(16)}`)
            }
        }
        this.unwind(a, t)
    }
    unwind(e, t) {
        e.length && (t.self = e[0].self,
        t.other = e[0].other)
    }
}
  , K = {
    CREATE: 0,
    DESTROY: 1,
    ALARM: 2,
    STEP: 3,
    COLLISION: 4,
    KEYBOARD: 5,
    MOUSE: 6,
    OTHER: 7,
    DRAW: 8,
    KEYPRESS: 9,
    KEYRELEASE: 10
}
  , q = {
    OUTSIDE: 0,
    GAME_START: 2,
    GAME_END: 3,
    ROOM_START: 4,
    ROOM_END: 5,
    ANIMATION_END: 7,
    PATH_END: 8,
    USER0: 10
}
  , J = {
    DRAW: 0,
    GUI: 64,
    BEGIN: 72,
    END: 73,
    GUI_BEGIN: 74,
    GUI_END: 75,
    PRE: 76,
    POST: 77
}
  , tn = 1e5
  , nn = 8
  , rn = class {
    data;
    renderer;
    audio;
    files;
    input;
    interp;
    globals = new Map;
    instances = [];
    byId = new Map;
    descendants;
    eventTables = [];
    globalSelf;
    nextId;
    nextOrder = 0;
    room;
    roomIndex = -1;
    roomSpeed = 30;
    roomWidth = 0;
    roomHeight = 0;
    roomPersistent = !1;
    persistentRooms = new Map;
    pendingRoom = null;
    pendingRestart = !1;
    ended = !1;
    onEnd;
    backgroundColor = 0;
    showBackgroundColor = !0;
    viewsEnabled = !1;
    viewCurrent = 0;
    views = [];
    backgrounds = [];
    tiles = [];
    drawColor = 16777215;
    drawAlpha = 1;
    drawFont = -1;
    halign = 0;
    valign = 0;
    circlePrecision = 24;
    surfaces = new Map;
    nextSurface = 1;
    appSurfaceId = 0;
    appSurfaceEnabled = !0;
    appSurfaceDraw = !0;
    measureObjects = [];
    measured = new Map;
    sceneView = null;
    dsMaps = new Map;
    nextDsMap = 0;
    actionRelative = !1;
    hiddenTileDepths = new Set;
    randomSeed = Math.random() * 4294967296 >>> 0;
    randomState = this.randomSeed;
    ghostMove = null;
    fixedClockFrom = null;
    startTime = performance.now();
    warned = new Set;
    frameCount = 0;
    outside = new WeakSet;
    elapsedMs() {
        return this.fixedClockFrom === null ? performance.now() - this.startTime : (this.frameCount - this.fixedClockFrom) * 1e3 / 30
    }
    setRandomSeed(e) {
        this.randomSeed = e >>> 0,
        this.randomState = this.randomSeed
    }
    random() {
        let e = this.randomState = this.randomState + 1831565813 >>> 0;
        return e = Math.imul(e ^ e >>> 15, e | 1),
        e ^= e + Math.imul(e ^ e >>> 7, e | 61),
        ((e ^ e >>> 14) >>> 0) / 4294967296
    }
    constructor(e, t) {
        this.data = e,
        this.renderer = t.renderer,
        this.audio = t.audio,
        this.files = t.files,
        this.input = t.input,
        this.onEnd = t.onEnd,
        this.interp = new en(e,this),
        this.descendants = e.objects.map( () => new Set);
        for (let t of e.objects)
            for (let n = t.index, r = 0; n >= 0 && r < 64; n = e.objects[n].parent,
            r++)
                this.descendants[n].add(t.index);
        let n = Math.max(tn, ...e.rooms.flatMap(e => e.instances.map(e => e.id)));
        this.nextId = n + 1,
        this.globalSelf = new Yt(-1,{
            index: -1,
            name: `<global>`,
            sprite: -1,
            visible: !1,
            solid: !1,
            depth: 0,
            persistent: !1,
            parent: -1,
            mask: -1,
            events: new Map
        },0,0,-1);
        for (let e = 0; e < nn; e++)
            this.views.push(sn());
        for (let e = 0; e < 8; e++)
            this.backgrounds.push(cn());
        let r = this.renderer.createSurface(this.renderer.width, this.renderer.height);
        this.surfaces.set(this.appSurfaceId, r)
    }
    start() {
        this.enterRoom(this.data.roomOrder[0], !0)
    }
    getVar(e, t, n, r) {
        let i = typeof t == `number` ? t : C(t);
        if (i === -7)
            return an(e.locals.get(n), r);
        if (i === -5)
            return an(this.globals.get(n), r);
        let a = Jt[n];
        if (a)
            return a.get(this, e, r);
        if (n.startsWith(`argument`)) {
            if (n === `argument`)
                return e.args[r ?? 0];
            if (n === `argument_count`)
                return e.args.length;
            let t = Number(n.slice(8));
            if (Number.isInteger(t))
                return e.args[t] ?? 0
        }
        let o = this.resolveOne(e, i);
        if (!o)
            return this.warn(`read ${n} on missing instance ${i}`),
            n === `x` || n === `y` ? qt[n].get(e.self, this, r) : 0;
        let s = qt[n];
        if (s)
            return s.get(o, this, r);
        let c = o.vars.get(n);
        return c === void 0 && !o.vars.has(n) ? (this.warn(`read of unset variable ${n} (${o.object.name})`),
        0) : an(c, r)
    }
    setVar(e, t, n, r, i) {
        r instanceof xt && i === void 0 && (r = r.clone());
        let a = typeof t == `number` ? t : C(t);
        if (a === -7)
            return on(e.locals, n, r, i);
        if (a === -5)
            return on(this.globals, n, r, i);
        let o = Jt[n];
        if (o) {
            o.set && o.set(this, e, r, i);
            return
        }
        if (n.startsWith(`argument`)) {
            let t = n === `argument` ? i ?? 0 : Number(n.slice(8));
            Number.isInteger(t) && (e.args[t] = r);
            return
        }
        let s = qt[n];
        for (let t of this.resolveAll(e, a))
            s ? s.set?.(t, r, this, i) : on(t.vars, n, r, i)
    }
    withTargets(e, t) {
        return this.resolveAll(e, C(t))
    }
    resolveOne(e, t) {
        if (t === -1)
            return e.self;
        if (t === -2)
            return e.other;
        if (t === -3)
            return this.instances.find(e => e.active && !e.destroyed) ?? null;
        if (t >= tn) {
            let e = this.byId.get(t);
            return e && !e.destroyed ? e : null
        }
        return t >= 0 && t < this.data.objects.length ? this.instancesOf(t)[0] ?? null : null
    }
    resolveAll(e, t) {
        if (t === -1)
            return [e.self];
        if (t === -2)
            return [e.other];
        if (t === -3)
            return this.instances.filter(e => e.active && !e.destroyed);
        if (t >= tn) {
            let e = this.byId.get(t);
            return e && !e.destroyed && e.active ? [e] : []
        }
        return t >= 0 && t < this.data.objects.length ? this.instancesOf(t) : []
    }
    instancesOf(e) {
        let t = this.descendants[e];
        return t ? this.instances.filter(e => e.active && !e.destroyed && t.has(e.object.index)) : []
    }
    isA(e, t) {
        return this.descendants[t]?.has(e.object.index) ?? !1
    }
    findInstance(e) {
        let t = this.byId.get(e);
        return t && !t.destroyed ? t : null
    }
    call(e, t, n) {
        let r = this.data.scripts.get(t);
        if (r !== void 0)
            return this.callScript(e, r, n);
        let i = Wt[t];
        return i ? i(this, e, n) : (this.warn(`unimplemented function ${t}`),
        0)
    }
    callScript(e, t, n) {
        return this.interp.run(t, {
            self: e.self,
            other: e.other,
            locals: new Map,
            args: n,
            event: e.event
        })
    }
    runCode(e, t, n, r=null) {
        try {
            return this.interp.run(e, {
                self: t,
                other: n,
                locals: new Map,
                args: [],
                event: r
            })
        } catch (t) {
            this.warn(`error in ${this.data.code[e]?.name}: ${t.message}`);
            return
        }
    }
    eventTable(e) {
        let t = this.eventTables[e];
        if (t)
            return t;
        let n = this.data.objects[e];
        if (t = new Map,
        n.parent >= 0)
            for (let[e,r] of this.eventTable(n.parent))
                t.set(e, new Map(r));
        for (let[r,i] of n.events) {
            let n = t.get(r);
            n || t.set(r, n = new Map);
            for (let[t,r] of i)
                n.set(t, {
                    code: r,
                    owner: e
                })
        }
        return this.eventTables[e] = t,
        t
    }
    hasEvent(e, t, n) {
        return this.eventTable(e.object.index).get(t)?.has(n) ?? !1
    }
    runEvent(e, t, n, r=e) {
        if (e.destroyed && t !== K.DESTROY)
            return !1;
        let i = this.eventTable(e.object.index).get(t)?.get(n);
        return i ? (this.runCode(i.code, e, r, {
            type: t,
            subtype: n,
            owner: i.owner
        }),
        !0) : !1
    }
    runInherited(e) {
        let t = e.event;
        if (!t)
            return;
        let n = this.data.objects[t.owner]?.parent ?? -1;
        if (n < 0)
            return;
        let r = this.eventTable(n).get(t.type)?.get(t.subtype);
        r && this.interp.run(r.code, {
            self: e.self,
            other: e.other,
            locals: new Map,
            args: [],
            event: {
                type: t.type,
                subtype: t.subtype,
                owner: r.owner
            }
        })
    }
    createInstance(e, t, n, r=this.nextId++) {
        let i = this.data.objects[n]
          , a = new Yt(r,i,e,t,this.nextOrder++);
        return this.instances.push(a),
        this.byId.set(a.id, a),
        a
    }
    spawn(e, t, n) {
        if (!this.data.objects[n])
            return null;
        let r = this.createInstance(e, t, n);
        return this.runEvent(r, K.CREATE, 0),
        r
    }
    destroy(e, t=!0) {
        e.destroyed || (e.destroyed = !0,
        t && this.runEvent(e, K.DESTROY, 0))
    }
    changeInstance(e, t, n) {
        n && this.runEvent(e, K.DESTROY, 0);
        let r = this.data.objects[t];
        r && (e.object = r,
        e.sprite = r.sprite,
        e.mask = r.mask,
        e.depth = r.depth,
        e.visible = r.visible,
        e.solid = r.solid,
        e.persistent = r.persistent,
        n && this.runEvent(e, K.CREATE, 0))
    }
    sweep() {
        this.instances.some(e => e.destroyed) && (this.instances = this.instances.filter(e => (e.destroyed && this.byId.delete(e.id),
        !e.destroyed)))
    }
    live() {
        return this.instances.filter(e => e.active && !e.destroyed)
    }
    gotoRoom(e) {
        this.data.rooms[e] && (this.pendingRoom = e)
    }
    restart() {
        this.pendingRestart = !0
    }
    end() {
        if (!this.ended) {
            this.ended = !0;
            for (let e of this.live())
                this.runEvent(e, K.OTHER, q.GAME_END);
            this.audio.stopAll(),
            this.onEnd()
        }
    }
    enterRoom(e, t) {
        if (this.roomIndex >= 0) {
            for (let e of this.live())
                this.runEvent(e, K.OTHER, q.ROOM_END);
            this.roomPersistent && this.persistentRooms.set(this.roomIndex, this.instances.filter(e => !e.persistent && !e.destroyed))
        }
        let n = this.instances.filter(e => e.persistent && !e.destroyed);
        this.instances = n,
        this.byId.clear();
        for (let e of n)
            this.byId.set(e.id, e);
        let r = this.data.rooms[e];
        for (this.room = r,
        this.roomIndex = e,
        this.roomSpeed = r.speed || 30,
        this.roomWidth = r.width,
        this.roomHeight = r.height,
        this.roomPersistent = r.persistent || this.persistentRooms.has(e),
        this.backgroundColor = r.backgroundColor & 16777215,
        this.showBackgroundColor = r.drawBackgroundColor,
        this.viewsEnabled = !!(r.flags & 1) || r.views.some(e => e.enabled),
        this.views = r.views.map(e => ({
            visible: e.enabled,
            x: e.viewX,
            y: e.viewY,
            w: e.viewW,
            h: e.viewH,
            portX: e.portX,
            portY: e.portY,
            portW: e.portW,
            portH: e.portH,
            angle: 0,
            borderX: e.borderX,
            borderY: e.borderY,
            speedX: e.speedX,
            speedY: e.speedY,
            object: e.object
        })); this.views.length < nn; )
            this.views.push(sn());
        for (this.backgrounds = r.backgrounds.map(e => ({
            visible: e.enabled,
            foreground: e.foreground,
            index: e.background,
            x: e.x,
            y: e.y,
            tileX: e.tileX,
            tileY: e.tileY,
            xscale: 1,
            yscale: 1,
            hspeed: e.speedX,
            vspeed: e.speedY,
            blend: 16777215,
            alpha: 1
        })); this.backgrounds.length < 8; )
            this.backgrounds.push(cn());
        r.backgrounds.forEach( (e, t) => {
            let n = this.data.backgrounds[e.background];
            e.stretch && n?.item && (this.backgrounds[t].xscale = r.width / n.item.boundingWidth,
            this.backgrounds[t].yscale = r.height / n.item.boundingHeight)
        }
        ),
        this.tiles = r.tiles.map(e => ({
            x: e.x,
            y: e.y,
            background: e.background,
            sourceX: e.sourceX,
            sourceY: e.sourceY,
            width: e.width,
            height: e.height,
            depth: e.depth,
            scaleX: e.scaleX,
            scaleY: e.scaleY,
            color: e.color & 16777215,
            alpha: (e.color >>> 24) / 255 || 1,
            visible: !0
        })),
        this.hiddenTileDepths.clear();
        let i = this.persistentRooms.get(e);
        if (i) {
            this.persistentRooms.delete(e);
            for (let e of i)
                this.instances.push(e),
                this.byId.set(e.id, e)
        } else {
            let e = [];
            for (let t of r.instances) {
                if (this.byId.has(t.id) || !this.data.objects[t.object])
                    continue;
                let n = this.createInstance(t.x, t.y, t.object, t.id);
                n.imageXscale = t.scaleX,
                n.imageYscale = t.scaleY,
                n.imageAngle = t.rotation,
                n.imageBlend = t.color & 16777215,
                n.imageAlpha = (t.color >>> 24) / 255 || 1,
                e.push([n, t])
            }
            for (let[t,n] of e)
                n.preCreateCode >= 0 && this.runCode(n.preCreateCode, t, t),
                this.runEvent(t, K.CREATE, 0),
                n.creationCode >= 0 && !t.destroyed && this.runCode(n.creationCode, t, t);
            r.creationCode >= 0 && this.runCode(r.creationCode, this.globalSelf, this.globalSelf)
        }
        if (t)
            for (let e of this.live())
                this.runEvent(e, K.OTHER, q.GAME_START);
        for (let e of this.live())
            this.runEvent(e, K.OTHER, q.ROOM_START);
        this.sweep()
    }
    step() {
        if (this.ended)
            return;
        this.frameCount++;
        for (let e of this.live())
            e.xprevious = e.x,
            e.yprevious = e.y;
        let e = this.ghostMove;
        e && !e.inst.destroyed && (e.inst.x += e.dx,
        e.inst.y += e.dy);
        for (let e of this.live())
            this.runEvent(e, K.STEP, 1);
        for (let e of this.live())
            for (let t = 0; t < e.alarm.length; t++)
                e.alarm[t] > 0 && (--e.alarm[t],
                e.alarm[t] <= 0 && (e.alarm[t] = -1,
                this.runEvent(e, K.ALARM, t)));
        this.keyboardEvents();
        for (let e of this.live())
            this.runEvent(e, K.STEP, 0);
        for (let e of this.live())
            this.move(e);
        for (let e of this.live())
            this.checkOutside(e);
        this.collisionEvents();
        for (let e of this.live())
            this.runEvent(e, K.STEP, 2);
        for (let e of this.live())
            this.animate(e);
        for (let e of this.backgrounds)
            e.x += e.hspeed,
            e.y += e.vspeed;
        this.followViews(),
        this.sweep(),
        this.ghostMove = null
    }
    afterFrame() {
        if (this.pendingRestart) {
            this.pendingRestart = !1,
            this.pendingRoom = null,
            this.audio.stopAll();
            for (let e of this.instances)
                e.destroyed = !0;
            this.instances = [],
            this.byId.clear(),
            this.globals.clear(),
            this.persistentRooms.clear(),
            this.roomIndex = -1,
            this.enterRoom(this.data.roomOrder[0], !0)
        } else if (this.pendingRoom !== null) {
            let e = this.pendingRoom;
            this.pendingRoom = null,
            this.enterRoom(e, !1)
        }
    }
    keyboardEvents() {
        let e = this.input
          , t = [[K.KEYBOARD, e.keysDown(), !0], [K.KEYPRESS, e.keysPressed(), !1], [K.KEYRELEASE, e.keysReleased(), !1]];
        for (let[e,n,r] of t) {
            let t = [...n];
            for (let n of this.live())
                if (this.eventTable(n.object.index).get(e)) {
                    for (let r of t)
                        this.runEvent(n, e, r);
                    t.length ? this.runEvent(n, e, 1) : r && this.runEvent(n, e, 0)
                }
        }
    }
    move(e) {
        if (e.friction !== 0) {
            let t = e.speed;
            if (t > 0) {
                let n = Math.max(0, t - e.friction);
                e.hspeed *= n / t,
                e.vspeed *= n / t
            }
        }
        if (e.gravity !== 0) {
            let t = e.gravityDirection * Math.PI / 180;
            e.hspeed += Math.cos(t) * e.gravity,
            e.vspeed -= Math.sin(t) * e.gravity
        }
        e.path >= 0 && this.followPath(e),
        e.x += e.hspeed,
        e.y += e.vspeed
    }
    followPath(e) {
        let t = this.data.paths[e.path];
        if (!t || t.points.length === 0) {
            e.path = -1;
            return
        }
        let n = dn(t.points, t.closed);
        if (n <= 0)
            return;
        if (e.pathPosition += e.pathSpeed / n,
        e.pathPosition >= 1 || e.pathPosition < 0) {
            let n = e.pathEndAction;
            if (n === 1)
                e.pathPosition = (e.pathPosition % 1 + 1) % 1;
            else if (n === 2) {
                let n = fn(t.points, t.closed, 0)
                  , r = fn(t.points, t.closed, 1)
                  , i = e.pathPosition >= 1 ? 1 : -1;
                e.pathOrigin = {
                    x: e.pathOrigin.x + i * (r.x - n.x),
                    y: e.pathOrigin.y + i * (r.y - n.y)
                },
                e.pathPosition = (e.pathPosition % 1 + 1) % 1
            } else if (n === 3)
                e.pathSpeed = -e.pathSpeed,
                e.pathPosition = Math.min(1, Math.max(0, e.pathPosition));
            else {
                e.pathPosition = Math.min(1, Math.max(0, e.pathPosition));
                let n = fn(t.points, t.closed, e.pathPosition);
                e.x = n.x + e.pathOrigin.x,
                e.y = n.y + e.pathOrigin.y,
                e.path = -1,
                this.runEvent(e, K.OTHER, q.PATH_END);
                return
            }
        }
        let r = fn(t.points, t.closed, e.pathPosition);
        e.x = r.x + e.pathOrigin.x,
        e.y = r.y + e.pathOrigin.y
    }
    checkOutside(e) {
        if (!this.hasEvent(e, K.OTHER, q.OUTSIDE))
            return;
        let t = this.bounds(e)
          , n = t ? t.right < 0 || t.bottom < 0 || t.left > this.roomWidth || t.top > this.roomHeight : e.x < 0 || e.y < 0 || e.x > this.roomWidth || e.y > this.roomHeight;
        n && !this.outside.has(e) ? (this.outside.add(e),
        this.runEvent(e, K.OTHER, q.OUTSIDE)) : n || this.outside.delete(e)
    }
    collisionEvents() {
        let e = this.ghostMove;
        for (let t of this.live()) {
            let n = this.eventTable(t.object.index).get(K.COLLISION);
            if (n)
                for (let[r,i] of n)
                    for (let n of this.instancesOf(r))
                        n === t || t.destroyed || n.destroyed || (!e || t !== e.inst && n !== e.inst || !e.through.some(r => this.isA(t === e.inst ? n : t, r))) && this.collide(t, n) && ((t.solid || n.solid) && (t.x = t.xprevious,
                        t.y = t.yprevious,
                        n.x = n.xprevious,
                        n.y = n.yprevious),
                        this.runCode(i.code, t, n, {
                            type: K.COLLISION,
                            subtype: r,
                            owner: i.owner
                        }))
        }
    }
    animate(e) {
        let t = this.data.spriteList[e.sprite];
        if (!t || e.imageSpeed === 0)
            return;
        let n = t.frames.length;
        e.imageIndex += e.imageSpeed,
        e.imageIndex >= n ? (e.imageIndex -= n,
        this.runEvent(e, K.OTHER, q.ANIMATION_END)) : e.imageIndex < 0 && (e.imageIndex += n,
        this.runEvent(e, K.OTHER, q.ANIMATION_END))
    }
    followViews() {
        if (this.viewsEnabled)
            for (let e of this.views) {
                if (!e.visible || e.object < 0)
                    continue;
                let t = this.resolveAll(this.dummyFrame(), e.object)[0];
                if (!t)
                    continue;
                let n = e.x
                  , r = e.y;
                t.x - n < e.borderX && (n = t.x - e.borderX),
                n + e.w - t.x < e.borderX && (n = t.x - e.w + e.borderX),
                t.y - r < e.borderY && (r = t.y - e.borderY),
                r + e.h - t.y < e.borderY && (r = t.y - e.h + e.borderY),
                n = Math.max(0, Math.min(n, this.roomWidth - e.w)),
                r = Math.max(0, Math.min(r, this.roomHeight - e.h)),
                e.speedX >= 0 && (n = e.x + Math.max(-e.speedX, Math.min(e.speedX, n - e.x))),
                e.speedY >= 0 && (r = e.y + Math.max(-e.speedY, Math.min(e.speedY, r - e.y))),
                e.x = n,
                e.y = r
            }
    }
    dummyFrame() {
        return {
            self: this.globalSelf,
            other: this.globalSelf,
            locals: new Map,
            args: [],
            event: null
        }
    }
    toCanvas(e, t) {
        let n = this.sceneView;
        if (!n)
            return null;
        let[r,i,a,o,s,c,l,u] = n;
        return {
            x: (e - r) * (a ? l / a : 1) + s,
            y: (t - i) * (o ? u / o : 1) + c
        }
    }
    bounds(e) {
        let t = this.data.spriteList[e.mask >= 0 ? e.mask : e.sprite];
        if (!t)
            return null;
        let n = e.imageXscale
          , r = e.imageYscale
          , i = [[t.bboxLeft - t.originX, t.bboxTop - t.originY], [t.bboxRight + 1 - t.originX, t.bboxTop - t.originY], [t.bboxLeft - t.originX, t.bboxBottom + 1 - t.originY], [t.bboxRight + 1 - t.originX, t.bboxBottom + 1 - t.originY]]
          , a = -e.imageAngle * Math.PI / 180
          , o = Math.cos(a)
          , s = Math.sin(a)
          , c = 1 / 0
          , l = 1 / 0
          , u = -1 / 0
          , d = -1 / 0;
        for (let[t,a] of i) {
            let i = t * n
              , f = a * r
              , p = e.x + i * o - f * s
              , m = e.y + i * s + f * o;
            c = Math.min(c, p),
            u = Math.max(u, p),
            l = Math.min(l, m),
            d = Math.max(d, m)
        }
        return {
            left: c,
            top: l,
            right: u,
            bottom: d
        }
    }
    pointInside(e, t, n, r=!0) {
        let i = this.bounds(e);
        if (!i || t < i.left || t >= i.right || n < i.top || n >= i.bottom)
            return !1;
        let a = this.data.spriteList[e.mask >= 0 ? e.mask : e.sprite];
        return !r || !a || a.collisionKind !== 1 || a.masks.length === 0 || un(a, e, t, n)
    }
    collide(e, t) {
        let n = this.bounds(e)
          , r = this.bounds(t);
        if (!n || !r)
            return !1;
        let i = Math.max(n.left, r.left)
          , a = Math.min(n.right, r.right)
          , o = Math.max(n.top, r.top)
          , s = Math.min(n.bottom, r.bottom);
        if (i >= a || o >= s)
            return !1;
        let c = this.data.spriteList[e.mask >= 0 ? e.mask : e.sprite]
          , l = this.data.spriteList[t.mask >= 0 ? t.mask : t.sprite]
          , u = c?.collisionKind === 1 && c.masks.length > 0
          , d = l?.collisionKind === 1 && l.masks.length > 0;
        if (!u && !d)
            return !0;
        for (let n = Math.floor(o); n < s; n++)
            for (let r = Math.floor(i); r < a; r++) {
                let a = r + .5
                  , s = n + .5;
                if (!(a < i || s < o) && (!u || un(c, e, a, s)) && (!d || un(l, t, a, s)))
                    return !0
            }
        return !1
    }
    findCollision(e, t, n, r) {
        for (let i of this.resolveAll(e, t))
            if (!(n && i === e.self) && r(i))
                return i.id;
        return -4
    }
    draw() {
        let e = this.renderer;
        this.measured.clear(),
        this.sceneView = null;
        let t = this.data.windowWidth
          , n = this.data.windowHeight
          , r = Math.max(0, (e.width - t) / 2)
          , i = Math.max(0, (e.height - n) / 2)
          , a = [-r, -i, e.width, e.height, 0, 0, e.width, e.height]
          , o = this.surfaces.get(this.appSurfaceId);
        (o.width !== e.width || o.height !== e.height) && (e.freeSurface(o),
        o = e.createSurface(e.width, e.height),
        this.surfaces.set(this.appSurfaceId, o));
        let s = this.appSurfaceEnabled
          , c = [0, 0, t, n];
        e.setTarget(null),
        this.activeTransform = a,
        this.logicalArea = c,
        this.applyView(),
        this.drawEvent(J.PRE),
        e.setTarget(s ? o : null),
        this.showBackgroundColor && e.clear(this.backgroundColor, 1);
        let l = this.viewsEnabled ? this.views.map( (e, t) => [e, t]).filter( ([e]) => e.visible) : [];
        if (l.length === 0)
            this.viewCurrent = 0,
            this.activeTransform = a,
            this.logicalArea = c,
            this.applyView(),
            this.sceneView = a,
            this.drawScene();
        else
            for (let[e,t] of l) {
                this.viewCurrent = t;
                let n = e.w ? e.portW / e.w : 1
                  , a = e.h ? e.portH / e.h : 1
                  , o = r / n
                  , s = i / a;
                this.activeTransform = [e.x - o, e.y - s, e.w + 2 * o, e.h + 2 * s, e.portX, e.portY, e.portW + 2 * r, e.portH + 2 * i],
                this.logicalArea = [e.x, e.y, e.w, e.h],
                this.applyView(),
                this.sceneView ??= this.activeTransform,
                this.drawScene()
            }
        this.targetStack.length = 0,
        e.setTarget(null),
        e.resetView(),
        s && this.appSurfaceDraw && e.drawPage(o, 0, 0, o.width, o.height, 0, 0, e.width, e.height, 16777215, 1),
        this.activeTransform = a,
        this.logicalArea = c,
        this.applyView(),
        this.drawEvent(J.POST),
        this.drawEvent(J.GUI_BEGIN),
        this.drawEvent(J.GUI),
        this.drawEvent(J.GUI_END),
        this.activeTransform = null,
        this.logicalArea = null,
        e.resetView()
    }
    drawEvent(e) {
        for (let t of this.sortedForDraw())
            t.visible && this.runEvent(t, K.DRAW, e)
    }
    sortedForDraw() {
        return this.live().sort( (e, t) => t.depth - e.depth || e.order - t.order)
    }
    drawScene() {
        this.drawBackgrounds(!1);
        let e = [];
        for (let t of this.live())
            t.visible && e.push({
                depth: t.depth,
                order: t.order,
                draw: () => {
                    let e = this.measureObjects.find(e => this.isA(t, e));
                    if (e !== void 0) {
                        let t = this.measured.get(e);
                        t || this.measured.set(e, t = {
                            left: 1 / 0,
                            top: 1 / 0,
                            right: -1 / 0,
                            bottom: -1 / 0
                        }),
                        this.renderer.bounds = t
                    }
                    this.runEvent(t, K.DRAW, J.DRAW) || this.drawSelf(t),
                    this.renderer.bounds = null
                }
            });
        for (let t of this.tiles)
            t.visible && !this.hiddenTileDepths.has(t.depth) && e.push({
                depth: t.depth,
                order: -1,
                draw: () => this.drawTile(t)
            });
        e.sort( (e, t) => t.depth - e.depth || e.order - t.order);
        for (let e of this.sortedForDraw())
            e.visible && this.runEvent(e, K.DRAW, J.BEGIN);
        for (let t of e)
            t.draw();
        for (let e of this.sortedForDraw())
            e.visible && this.runEvent(e, K.DRAW, J.END);
        this.drawBackgrounds(!0)
    }
    drawSelf(e) {
        let t = this.data.spriteList[e.sprite];
        t && this.drawSprite(t, e.imageIndex, e.x, e.y, e.imageXscale, e.imageYscale, e.imageAngle, e.imageBlend, e.imageAlpha)
    }
    drawSprite(e, t, n, r, i, a, o, s, c) {
        if (e.frames.length === 0)
            return;
        let l = e.frames.length
          , u = e.frames[(Math.floor(t) % l + l) % l];
        this.drawItem(u, n, r, e.originX, e.originY, i, a, o, s, c)
    }
    drawItem(e, t, n, r, i, a, o, s, c, l) {
        let u = (e.targetX - r) * a
          , d = (e.targetY - i) * o
          , f = (e.targetX + e.targetWidth - r) * a
          , p = (e.targetY + e.targetHeight - i) * o;
        if (s === 0 && e.sourceWidth <= 32 && e.sourceHeight <= 32) {
            let r = [t + Math.min(u, f), n + Math.min(d, p), t + Math.max(u, f), n + Math.max(d, p)]
              , [i,a,o,s] = this.coverArea(...r);
            if (i !== r[0] || a !== r[1] || o !== r[2] || s !== r[3]) {
                let t = e.sourceX + e.sourceWidth / 2
                  , n = e.sourceY + e.sourceHeight / 2;
                this.renderer.quad(e.page, t, n, .01, .01, [{
                    x: i,
                    y: a
                }, {
                    x: o,
                    y: a
                }, {
                    x: i,
                    y: s
                }, {
                    x: o,
                    y: s
                }], [c, c, c, c], l);
                return
            }
        }
        let m = [[u, d], [f, d], [u, p], [f, p]].map( ([e,r]) => ln(t, n, e, r, s));
        this.renderer.quad(e.page, e.sourceX, e.sourceY, e.sourceWidth, e.sourceHeight, m, [c, c, c, c], l)
    }
    drawTile(e) {
        let t = this.data.backgrounds[e.background];
        if (!t?.item)
            return;
        let n = t.item;
        this.renderer.drawRegion(n.page, n.sourceX + e.sourceX - n.targetX, n.sourceY + e.sourceY - n.targetY, e.width, e.height, e.x, e.y, e.width * e.scaleX, e.height * e.scaleY, e.color, e.alpha)
    }
    drawBackgrounds(e) {
        for (let t of this.backgrounds) {
            if (!t.visible || t.foreground !== e)
                continue;
            let n = this.data.backgrounds[t.index];
            if (!n?.item)
                continue;
            let r = n.item
              , i = r.boundingWidth * t.xscale
              , a = r.boundingHeight * t.yscale;
            if (i <= 0 || a <= 0)
                continue;
            let o = this.activeTransform
              , s = o ? o[0] : 0
              , c = o ? o[1] : 0
              , l = o ? o[2] : this.roomWidth
              , u = o ? o[3] : this.roomHeight
              , d = t.tileX ? t.x - Math.ceil((t.x - s) / i) * i : t.x
              , f = t.tileY ? t.y - Math.ceil((t.y - c) / a) * a : t.y;
            for (let e = f; e < (t.tileY ? c + u : f + 1); e += a)
                for (let n = d; n < (t.tileX ? s + l : d + 1); n += i)
                    this.drawItem(r, n, e, 0, 0, t.xscale, t.yscale, 0, t.blend, t.alpha)
        }
    }
    activeTransform = null;
    logicalArea = null;
    coverArea(e, t, n, r) {
        let i = this.logicalArea
          , a = this.activeTransform;
        if (!i || !a || this.targetStack.length)
            return [e, t, n, r];
        let[o,s,c,l] = i;
        return e > o + 1 || t > s + 1 || n < o + c - 1 || r < s + l - 1 ? [e, t, n, r] : [Math.min(e, a[0]), Math.min(t, a[1]), Math.max(n, a[0] + a[2]), Math.max(r, a[1] + a[3])]
    }
    targetStack = [];
    pushTarget(e) {
        this.targetStack.push(this.renderer.getTarget()),
        this.renderer.setTarget(e),
        this.renderer.resetView()
    }
    popTarget() {
        this.targetStack.length && (this.renderer.setTarget(this.targetStack.pop() ?? null),
        this.targetStack.length === 0 && this.applyView())
    }
    applyView() {
        let e = this.activeTransform;
        e ? this.renderer.setView(...e) : this.renderer.resetView()
    }
    spriteFromSurface(e, t, n, r, i, a, o) {
        let s = this.surfaces.get(e);
        if (!s || r <= 0 || i <= 0)
            return -1;
        let c = this.renderer.createSurface(Math.floor(r), Math.floor(i))
          , l = this.renderer.getTarget();
        this.renderer.setTarget(c),
        this.renderer.resetView(),
        this.renderer.drawPage(s, t, n, r, i, 0, 0, r, i, 16777215, 1),
        this.renderer.setTarget(l),
        this.applyView();
        let u = this.renderer.registerPage(c)
          , d = this.data.spriteList.length
          , f = {
            sourceX: 0,
            sourceY: 0,
            sourceWidth: r,
            sourceHeight: i,
            targetX: 0,
            targetY: 0,
            targetWidth: r,
            targetHeight: i,
            boundingWidth: r,
            boundingHeight: i,
            page: u
        };
        return this.data.spriteList.push({
            index: d,
            name: `__surface_sprite_${d}`,
            width: r,
            height: i,
            originX: a,
            originY: o,
            bboxLeft: 0,
            bboxRight: r - 1,
            bboxTop: 0,
            bboxBottom: i - 1,
            bboxMode: 1,
            collisionKind: 0,
            frames: [f],
            masks: []
        }),
        d
    }
    deleteSprite(e) {
        let t = this.data.spriteList[e];
        t?.name.startsWith(`__surface_sprite_`) && (t.frames = [])
    }
    placeCollision(e, t, n, r, i=!1) {
        let a = e.self
          , o = a.x
          , s = a.y;
        a.x = t,
        a.y = n;
        try {
            return this.findCollision(e, r, !0, e => (!i || e.solid) && this.collide(a, e))
        } finally {
            a.x = o,
            a.y = s
        }
    }
    rectOverlaps(e, t, n, r, i, a) {
        let o = this.bounds(e);
        if (!o || o.left >= r + 1 || o.right <= t || o.top >= i + 1 || o.bottom <= n)
            return !1;
        let s = this.data.spriteList[e.mask >= 0 ? e.mask : e.sprite];
        if (!a || !s || s.collisionKind !== 1 || s.masks.length === 0)
            return !0;
        for (let a = Math.max(Math.floor(n), Math.floor(o.top)); a <= Math.min(i, o.bottom - 1); a++)
            for (let n = Math.max(Math.floor(t), Math.floor(o.left)); n <= Math.min(r, o.right - 1); n++)
                if (un(s, e, n + .5, a + .5))
                    return !0;
        return !1
    }
    createSurface(e, t) {
        let n = this.nextSurface++;
        return this.surfaces.set(n, this.renderer.createSurface(Math.max(1, Math.floor(e)), Math.max(1, Math.floor(t)))),
        n
    }
    freeSurface(e) {
        let t = this.surfaces.get(e);
        t && e !== this.appSurfaceId && (this.renderer.freeSurface(t),
        this.surfaces.delete(e))
    }
    warn(e) {
        this.warned.has(e) || (this.warned.add(e),
        this.warned.size < 400 && console.warn(`[game] ${e}`))
    }
    get warnings() {
        return [...this.warned]
    }
}
;
function an(e, t) {
    return t === void 0 ? e : e instanceof xt ? e.get(t) ?? 0 : t === 0 ? e : 0
}
function on(e, t, n, r) {
    if (r === void 0) {
        e.set(t, n);
        return
    }
    let i = e.get(t);
    if (!(i instanceof xt)) {
        let n = i;
        i = new xt,
        n !== void 0 && i.set(0, n),
        e.set(t, i)
    }
    i.set(r, n)
}
function sn() {
    return {
        visible: !1,
        x: 0,
        y: 0,
        w: 640,
        h: 480,
        portX: 0,
        portY: 0,
        portW: 640,
        portH: 480,
        angle: 0,
        borderX: 0,
        borderY: 0,
        speedX: -1,
        speedY: -1,
        object: -1
    }
}
function cn() {
    return {
        visible: !1,
        foreground: !1,
        index: -1,
        x: 0,
        y: 0,
        tileX: !1,
        tileY: !1,
        xscale: 1,
        yscale: 1,
        hspeed: 0,
        vspeed: 0,
        blend: 16777215,
        alpha: 1
    }
}
function ln(e, t, n, r, i) {
    if (i === 0)
        return {
            x: e + n,
            y: t + r
        };
    let a = -i * Math.PI / 180
      , o = Math.cos(a)
      , s = Math.sin(a);
    return {
        x: e + n * o - r * s,
        y: t + n * s + r * o
    }
}
function un(e, t, n, r) {
    let i = n - t.x
      , a = r - t.y;
    if (t.imageAngle !== 0) {
        let e = t.imageAngle * Math.PI / 180
          , n = Math.cos(e)
          , r = Math.sin(e);
        [i,a] = [i * n - a * r, i * r + a * n]
    }
    let o = Math.floor(i / t.imageXscale + e.originX)
      , s = Math.floor(a / t.imageYscale + e.originY);
    if (o < 0 || s < 0 || o >= e.width || s >= e.height)
        return !1;
    let c = e.masks.length;
    return !!(e.masks[c === 1 ? 0 : (Math.floor(t.imageIndex) % c + c) % c][s * (e.width + 7 >> 3) + (o >> 3)] & 128 >> (o & 7))
}
function dn(e, t) {
    let n = 0
      , r = t ? e.length : e.length - 1;
    for (let t = 0; t < r; t++) {
        let r = e[t]
          , i = e[(t + 1) % e.length];
        n += Math.hypot(i.x - r.x, i.y - r.y)
    }
    return n
}
function fn(e, t, n) {
    if (e.length === 1)
        return e[0];
    let r = n * dn(e, t)
      , i = t ? e.length : e.length - 1;
    for (let t = 0; t < i; t++) {
        let n = e[t]
          , a = e[(t + 1) % e.length]
          , o = Math.hypot(a.x - n.x, a.y - n.y);
        if (r <= o || t === i - 1) {
            let e = o > 0 ? Math.min(1, r / o) : 0;
            return {
                x: n.x + (a.x - n.x) * e,
                y: n.y + (a.y - n.y) * e
            }
        }
        r -= o
    }
    return e[e.length - 1]
}
var pn = new Set([8, 9, 13, 16, 17, 18, 27, 32, 37, 38, 39, 40, 65, 67, 68, 83, 87, 88, 90])
  , mn = 13
  , hn = new Map([[87, 38], [65, 37], [83, 40], [68, 39], [32, mn]]);
function gn(e) {
    return hn.get(e) ?? (e >= 37 && e <= 40 ? e : void 0)
}
var _n = class {
    down = new Set;
    pressed = new Set;
    released = new Set;
    pendingPressed = new Set;
    pendingReleased = new Set;
    tapped = new Set;
    tappedNext = new Set;
    skipHeld = !1;
    lastKey = 0;
    currentKey = 0;
    lastChar = ``;
    keyboardString = ``;
    target;
    holders = new Map;
    onKeyDown = e => {
        if (pn.has(e.keyCode) && e.preventDefault(),
        e.keyCode === mn) {
            this.skipHeld = !0;
            return
        }
        if (e.repeat)
            return;
        let t = gn(e.keyCode);
        t !== void 0 && t !== e.keyCode && this.press(e.keyCode),
        t === void 0 ? this.press(e.keyCode) : this.hold(t, e.keyCode),
        e.key.length === 1 && (this.lastChar = e.key,
        this.keyboardString = (this.keyboardString + e.key).slice(-1024))
    }
    ;
    onKeyUp = e => {
        if (e.keyCode === mn) {
            this.skipHeld = !1;
            return
        }
        let t = gn(e.keyCode);
        t !== void 0 && t !== e.keyCode && this.release(e.keyCode),
        t === void 0 ? this.release(e.keyCode) : this.unhold(t, e.keyCode)
    }
    ;
    onBlur = () => {
        this.skipHeld = !1,
        this.holders.clear();
        for (let e of [...this.down])
            this.release(e)
    }
    ;
    hold(e, t) {
        let n = this.holders.get(e);
        n || this.holders.set(e, n = new Set),
        n.add(t),
        this.press(e)
    }
    unhold(e, t) {
        let n = this.holders.get(e);
        n?.delete(t),
        n?.size || this.release(e)
    }
    constructor(e) {
        this.target = e,
        e.addEventListener(`keydown`, this.onKeyDown),
        e.addEventListener(`keyup`, this.onKeyUp),
        e.addEventListener(`blur`, this.onBlur)
    }
    dispose() {
        this.target.removeEventListener(`keydown`, this.onKeyDown),
        this.target.removeEventListener(`keyup`, this.onKeyUp),
        this.target.removeEventListener(`blur`, this.onBlur)
    }
    beginStep() {
        for (let e of this.tapped)
            this.release(e);
        this.tapped = this.tappedNext,
        this.tappedNext = new Set,
        this.pressed = this.pendingPressed,
        this.released = this.pendingReleased,
        this.pendingPressed = new Set,
        this.pendingReleased = new Set
    }
    isDown(e) {
        return e === 1 ? this.down.size > 0 : e === 0 ? this.down.size === 0 : this.down.has(e)
    }
    wasPressed(e) {
        return e === 1 ? this.pressed.size > 0 : e === 0 ? this.pressed.size === 0 : this.pressed.has(e)
    }
    wasReleased(e) {
        return e === 1 ? this.released.size > 0 : e === 0 ? this.released.size === 0 : this.released.has(e)
    }
    keysDown() {
        return this.down
    }
    keysPressed() {
        return this.pressed
    }
    keysReleased() {
        return this.released
    }
    press(e) {
        this.down.has(e) || this.pendingPressed.add(e),
        this.down.add(e),
        this.lastKey = this.currentKey = e
    }
    release(e) {
        this.down.delete(e) && this.pendingReleased.add(e),
        this.currentKey === e && (this.currentKey = 0)
    }
    clear(e) {
        this.down.delete(e),
        this.pressed.delete(e),
        this.released.delete(e),
        this.pendingPressed.delete(e)
    }
    tap(e) {
        this.press(e),
        this.tappedNext.add(e)
    }
}
  , vn = 1e3
  , yn = 15
  , bn = 60
  , xn = 5400
  , Sn = 90
  , Y = 26
  , Cn = 11
  , wn = 12
  , Tn = 300
  , En = class {
    game;
    input;
    audio;
    renderer;
    font;
    objectIndex;
    hold = 0;
    phase = `none`;
    fade = 0;
    skipSteps = 0;
    loadWait = 0;
    setVolume(e) {
        this.audio.setVolume(e)
    }
    constructor(e, t, n, r, i, a=!1, o=!1) {
        this.renderer = e,
        this.input = new _n(window),
        this.audio = o ? new pt : new mt(t,n),
        this.audio.resume();
        let s = new _t(new Map(r.files), (e, t) => r.writeFile(e, t));
        this.font = t.fonts.get(`fnt_small`);
        let c = new Map(t.objects.map(e => [e.name, e.index]));
        this.objectIndex = e => c.get(e) ?? -1,
        this.game = new rn(t,{
            renderer: e,
            audio: this.audio,
            files: s,
            input: this.input,
            onEnd: () => {
                this.dispose(),
                i()
            }
        }),
        this.game.measureObjects = [`obj_dialoguer`, `obj_borderparent`, `obj_base_writer`].map(this.objectIndex).filter(e => e >= 0),
        this.game.start(),
        a && (this.loadWait = Tn)
    }
    get frameMs() {
        return 1e3 / this.game.roomSpeed
    }
    get awaitingConfirm() {
        if (this.phase !== `none` || this.game.ended || this.exists(`obj_choicer`))
            return !1;
        let e = this.objectIndex(`obj_base_writer`);
        return e >= 0 && this.game.instancesOf(e).some(e => e.vars.get(`halt`) === 1 || e.vars.get(`halt`) === 2)
    }
    get skipping() {
        return this.phase !== `none`
    }
    update() {
        switch (this.phase) {
        case `fadeOut`:
            ++this.fade >= yn && (this.phase = `skipping`,
            this.skipSteps = 0,
            this.audio.setMuted(!0));
            return;
        case `skipping`:
            this.skipBatch();
            return;
        case `fadeIn`:
            --this.fade <= 0 && (this.phase = `none`);
            return
        }
        this.input.skipHeld && this.canSkip() ? (this.hold = Math.min(1, this.hold + this.frameMs / vn),
        this.hold >= 1 && (this.hold = 0,
        this.phase = `fadeOut`,
        this.fade = 0)) : this.hold = 0,
        this.input.beginStep(),
        this.game.step(),
        this.loadWait > 0 && this.loadOnceStarted()
    }
    draw() {
        this.phase === `skipping` ? this.drawLabel(`SKIPPING`) : (this.game.draw(),
        this.fade > 0 && (this.renderer.resetView(),
        this.renderer.fillRect(0, 0, this.renderer.width, this.renderer.height, 0, this.fade / yn)),
        this.drawSkipBar(),
        this.drawConfirmHint(),
        this.drawInteractHint(),
        this.game.afterFrame())
    }
    dispose() {
        this.input.dispose(),
        this.audio.close()
    }
    saveNow() {
        let e = this.game;
        if (this.phase !== `none` || e.ended || this.global(`interact`) !== 0 || this.global(`inbattle`) !== 0)
            return !1;
        let t = e.instances.find(e => e.object.name === `obj_mainchara` && !e.destroyed)
          , n = e.data.scripts.get(`scr_save`);
        return !t || n === void 0 ? !1 : (e.runCode(n, t, t),
        !0)
    }
    loadOnceStarted() {
        let e = this.game
          , t = e.data.roomNames[e.roomIndex];
        if (t === `room_start` && --this.loadWait > 0)
            return;
        this.loadWait = 0;
        let n = e.data.scripts.get(`scr_load`)
          , r = e.instances.find(e => !e.destroyed);
        !e.ended && t === `room_introstory` && n !== void 0 && r && e.files.exists(`file0`) && (this.audio.stopAll(),
        e.runCode(n, r, r))
    }
    global(e) {
        let t = this.game.globals.get(e);
        return typeof t == `number` ? t : 0
    }
    exists(e) {
        let t = this.objectIndex(e);
        return t >= 0 && this.game.instancesOf(t).length > 0
    }
    inIntro() {
        return this.game.data.roomNames[this.game.roomIndex] === `room_introstory`
    }
    canSkip() {
        return this.game.ended || this.global(`inbattle`) !== 0 || this.exists(`obj_choicer`) ? !1 : this.global(`interact`) === 1 || this.inIntro()
    }
    skipBatch() {
        for (let e = 0; e < bn; e++) {
            if (!this.canSkip() || this.skipSteps >= xn) {
                this.finishSkip();
                return
            }
            this.skipSteps % 2 == 0 && this.exists(`OBJ_WRITER`) && this.input.tap(Sn),
            this.input.beginStep(),
            this.game.step(),
            this.game.draw(),
            this.game.afterFrame(),
            this.skipSteps++
        }
    }
    finishSkip() {
        this.input.beginStep(),
        this.phase = `fadeIn`,
        this.fade = yn,
        this.audio.setMuted(!1)
    }
    drawLabel(e) {
        if (!this.font)
            return;
        let t = this.renderer;
        t.resetView(),
        qe(t, this.font, e, t.width - 16, t.height - 30, {
            scale: 2,
            align: `right`,
            color: x
        })
    }
    drawConfirmHint() {
        if (!this.awaitingConfirm)
            return;
        let e = e => this.game.measured.get(this.objectIndex(e))
          , t = e(`obj_base_writer`);
        if (!t)
            return;
        let n = this.renderer, r = Math.max(1, Math.round(n.height / this.game.data.windowHeight)), i = Y * r, a = Cn * r, o = wn * r, s = (t.left + t.right) / 2, c = (t.top + t.bottom) / 2, l = [e(`obj_dialoguer`), e(`obj_borderparent`)].find(e => e && s >= e.left && s <= e.right && c >= e.top && c <= e.bottom), u, d;
        l ? (u = l.right > n.width - o ? l.left + o : l.right - o - i,
        d = Math.min(l.bottom, n.height) - o - a) : (u = t.right + r * 4 + i > n.width ? t.left - r * 4 - i : t.right + r * 4,
        d = t.bottom - a),
        this.drawSpaceKey(Math.round(u), Math.round(d), r)
    }
    interactTarget() {
        let e = this.game;
        if (this.phase !== `none` || e.ended || this.global(`interact`) !== 0 || this.global(`inbattle`) !== 0 || this.exists(`obj_itemswapper`))
            return null;
        let t = this.objectIndex(`obj_interactable`)
          , n = e.instances.find(e => e.object.name === `obj_mainchara` && e.active && !e.destroyed);
        if (t < 0 || !n || Number(n.vars.get(`uncan`) ?? 0) !== 0)
            return null;
        let {x: r, y: i} = n
          , a = Number(qt.sprite_width.get(n, e))
          , o = Number(qt.sprite_height.get(n, e))
          , s = {
            0: [r + 4, i + 20, r + a - 4, i + o + 15],
            1: [r + a / 2, i + o / 2, r + a + 15, i + o],
            2: [r + 4, i + o - 5, r + a - 4, i + 8],
            3: [r + a / 2, i + 3 + o / 2, r - 15, i + o + 3]
        }[this.global(`facing`)];
        if (!s)
            return null;
        let[c,l,u,d] = [Math.min(s[0], s[2]), Math.min(s[1], s[3]), Math.max(s[0], s[2]), Math.max(s[1], s[3])];
        return e.instancesOf(t).find(t => t !== n && e.rectOverlaps(t, c, l, u, d, !1)) ?? null
    }
    drawInteractHint() {
        let e = this.interactTarget();
        if (!e)
            return;
        let t = this.game
          , n = e.visible ? t.data.spriteList[e.sprite] : void 0
          , r = n ? {
            left: e.x - n.originX * e.imageXscale,
            right: e.x + (n.width - n.originX) * e.imageXscale,
            top: e.y - n.originY * e.imageYscale
        } : t.bounds(e) ?? {
            left: e.x,
            top: e.y,
            right: e.x
        }
          , i = t.toCanvas((r.left + r.right) / 2, r.top);
        if (!i)
            return;
        let a = this.renderer
          , o = Math.max(1, Math.round(a.height / t.data.windowHeight))
          , s = 4 * o
          , c = Math.round(Math.min(Math.max(i.x - Y * o / 2, s), a.width - Y * o - s))
          , l = Math.round(Math.max(i.y - s - Cn * o, s));
        this.drawSpaceKey(c, l, o)
    }
    drawSpaceKey(e, t, n) {
        let r = this.renderer
          , i = Y * n
          , a = Cn * n
          , o = .65 + .35 * Math.sin(performance.now() / 250);
        r.resetView(),
        r.fillRect(e - n, t - n, i + 2 * n, a + 2 * n, 0, .8 * o);
        let s = (i, a, s, c) => r.fillRect(e + i * n, t + a * n, s * n, c * n, x, o);
        s(0, 0, Y, 1),
        s(0, 10, Y, 1),
        s(0, 0, 1, Cn),
        s(25, 0, 1, Cn),
        s(7, 6, 1, 2),
        s(18, 6, 1, 2),
        s(7, 7, 12, 1)
    }
    drawSkipBar() {
        if (this.hold <= 0)
            return;
        let e = this.renderer;
        e.resetView();
        let t = e.width - 120 - 16
          , n = e.height - 24;
        e.fillRect(t - 2, n - 2, 124, 10, 0, .7),
        e.fillRect(t, n, 120, 6, 4210752, 1),
        e.fillRect(t, n, Math.round(120 * this.hold), 6, x, 1),
        this.font && qe(e, this.font, `HOLD TO SKIP`, t + 120, n - 16, {
            scale: 2,
            align: `right`,
            color: x
        })
    }
}
  , X = class extends Error {
}
  , Dn = `undertale-game`
  , On = /^[\w-][\w.-]*$/
  , kn = e => e.name.toLowerCase() === `data.win`
  , An = e => e.name.toLowerCase().endsWith(`.ogg`) && On.test(e.name);
async function jn(e, t) {
    let n = await fetch(e);
    if (!n.ok || !n.body)
        throw Error(`${e}: HTTP ${n.status}`);
    let r = Number(n.headers.get(`Content-Length`)) || 0
      , i = []
      , a = 0;
    for (let e = n.body.getReader(); ; ) {
        let {done: n, value: o} = await e.read();
        if (n)
            break;
        i.push(o),
        a += o.length,
        r && t(a / r)
    }
    let o = new Uint8Array(a)
      , s = 0;
    for (let e of i)
        o.set(e, s),
        s += e.length;
    return o
}
async function Mn(e) {
    return {
        data: await jn(`/game/data.win`, e),
        musicUrl: e => `/game/${encodeURIComponent(e)}`
    }
}
async function Nn(e) {
    let t = e.find(kn);
    if (!t)
        throw new X(`No data.win found.`);
    let n = new Map(e.filter(An).map(e => [e.name.toLowerCase(), e]))
      , r = new Map;
    return {
        data: new Uint8Array(await t.arrayBuffer()),
        musicUrl(e) {
            let t = e.toLowerCase()
              , i = r.get(t);
            if (!i) {
                let e = n.get(t);
                if (!e)
                    return null;
                i = URL.createObjectURL(e),
                r.set(t, i)
            }
            return i
        }
    }
}
async function Pn() {
    try {
        let e = await (await navigator.storage.getDirectory()).getDirectoryHandle(Dn)
          , t = [];
        for await(let n of e.values())
            n.kind === `file` && t.push(await n.getFile());
        return t.some(kn) ? await Nn(t) : null
    } catch {
        return null
    }
}
async function Fn(e) {
    let t = e => e.webkitRelativePath || e.name
      , n = e => t(e).slice(0, Math.max(0, t(e).lastIndexOf(`/`)))
      , r = e.filter(kn).sort( (e, n) => t(e).split(`/`).length - t(n).split(`/`).length)[0];
    if (!r)
        throw new X(`That folder has no data.win in it. Pick the folder Undertale is installed in.`);
    let i = n(r)
      , a = e.filter(e => n(e) === i && (e === r || An(e)));
    return {
        source: await Nn(a),
        files: a
    }
}
async function In(e, t) {
    let n;
    try {
        n = await navigator.storage.getDirectory(),
        await n.removeEntry(Dn, {
            recursive: !0
        }).catch( () => void 0);
        let r = await n.getDirectoryHandle(Dn, {
            create: !0
        })
          , i = [...e.filter(e => !kn(e)), ...e.filter(kn)]
          , a = i.reduce( (e, t) => e + t.size, 0)
          , o = 0;
        for (let e of i) {
            let n = await (await r.getFileHandle(e.name, {
                create: !0
            })).createWritable();
            await n.write(e),
            await n.close(),
            o += e.size,
            t(o / a)
        }
        return navigator.storage.persist?.().catch( () => !1),
        !0
    } catch (e) {
        return console.warn(`Could not keep the game files in this browser:`, e),
        await n?.removeEntry(Dn, {
            recursive: !0
        }).catch( () => void 0),
        !1
    }
}
async function Ln() {
    await (await navigator.storage.getDirectory()).removeEntry(Dn, {
        recursive: !0
    }).catch( () => void 0)
}
var Rn = {
    continue: `Continue`,
    import: `Import Save`,
    new: `Start New Game`
}
  , zn = 44
  , Bn = [`z`, `Enter`];
function Vn(e) {
    let t = e.fonts.get(`fnt_main`)
      , n = e.fonts.get(`fnt_small`)
      , r = e.sprites.get(`spr_heart`);
    if (!t || !n || !r)
        throw Error(`data.win is missing fnt_main, fnt_small or spr_heart`);
    return {
        menuFont: t,
        smallFont: n,
        heart: r
    }
}
function Hn(e) {
    return new Set([e.menuFont.item.page, e.smallFont.item.page, ...e.heart.frames.map(e => e.page)])
}
var Un = class {
    actions = [];
    selected = 0;
    newGameInProgress = !1;
    confirmingNew = !1;
    message = ``;
    messageColor = x;
    r;
    ui;
    keyboard;
    pointer;
    onAction;
    constructor(e, t, n, r, i) {
        this.r = e,
        this.ui = t,
        this.keyboard = n,
        this.pointer = r,
        this.onAction = i
    }
    reset(e, t) {
        this.newGameInProgress = t,
        this.actions = e ? [`continue`, `import`, `new`] : [`import`, `new`],
        this.selected = this.actions.indexOf(`new`),
        this.confirmingNew = !1,
        this.say(``)
    }
    say(e, t=x) {
        this.message = e,
        this.messageColor = t
    }
    update() {
        let {keyboard: e, pointer: t} = this;
        e.pressed(`ArrowUp`) && this.select(this.selected - 1),
        e.pressed(`ArrowDown`) && this.select(this.selected + 1);
        let n = this.rowAt(t.x, t.y);
        t.moved && n >= 0 && this.select(n),
        (e.pressed(...Bn) || t.clicked && n >= 0) && this.activate()
    }
    draw() {
        let {r: e, ui: t} = this
          , n = this.rowsTop();
        this.actions.forEach( (r, i) => {
            let a = Rn[r]
              , o = n + i * zn
              , s = i === this.selected;
            if (qe(e, t.menuFont, a, e.width / 2, o, {
                color: s ? Ue : x,
                align: `center`
            }),
            s) {
                let n = e.width / 2 - Ke(t.menuFont, a) / 2 - t.heart.width - 12;
                Ge(e, t.heart, 0, n, o + Math.round((t.menuFont.lineHeight - t.heart.height) / 2))
            }
        }
        ),
        this.message && qe(e, t.smallFont, this.message, e.width / 2, e.height / 2 + 120, {
            color: this.messageColor,
            scale: 2,
            align: `center`
        }),
        qe(e, t.smallFont, `Arrows or WASD: move     Enter: select`, e.width / 2, e.height - 40, {
            color: We,
            scale: 2,
            align: `center`
        })
    }
    select(e) {
        let t = Math.max(0, Math.min(this.actions.length - 1, e));
        t !== this.selected && (this.selected = t,
        this.confirmingNew && (this.confirmingNew = !1,
        this.say(``)))
    }
    activate() {
        let e = this.actions[this.selected];
        e === `new` && this.newGameInProgress && !this.confirmingNew ? (this.confirmingNew = !0,
        this.say(`This restarts your new game from the beginning.
An imported save is kept. Select again to confirm.`, Ue)) : this.onAction(e)
    }
    rowsTop() {
        return Math.round(this.r.height / 2 - this.actions.length * zn / 2) - 20
    }
    rowAt(e, t) {
        if (e < 0)
            return -1;
        let n = Math.floor((t - this.rowsTop()) / zn);
        if (n < 0 || n >= this.actions.length)
            return -1;
        let r = Ke(this.ui.menuFont, Rn[this.actions[n]]) / 2 + this.ui.heart.width + 16;
        return Math.abs(e - this.r.width / 2) <= r ? n : -1
    }
}
  , Wn = 1e3 / 30
  , Z = document.querySelector(`#screen`)
  , Q = document.querySelector(`#status`)
  , Gn = document.querySelector(`#picker`)
  , Kn = document.querySelector(`#export`)
  , qn = document.querySelector(`#export-status`)
  , $ = document.querySelector(`#volume`)
  , Jn = document.querySelector(`#volume-value`)
  , Yn = document.querySelector(`#audio-toggle`)
  , Xn = document.querySelector(`#setup`)
  , Zn = document.querySelector(`#game-pick`)
  , Qn = document.querySelector(`#game-picker`)
  , $n = document.querySelector(`#setup-status`)
  , er = document.querySelector(`#forget-game`)
  , tr = `undertale-web-volume`;
function nr() {
    try {
        let e = Number(localStorage.getItem(tr));
        return localStorage.getItem(tr) !== null && Number.isFinite(e) ? Math.min(100, Math.max(0, e)) : 100
    } catch {
        return 100
    }
}
var rr = e => (e / 100) ** 2;
function ir(e) {
    let t = Math.max(320, innerWidth)
      , n = Math.max(240, innerHeight)
      , r = t / n
      , i = r >= 4 / 3 ? Math.round(480 * r) : 640
      , a = r >= 4 / 3 ? 480 : Math.round(640 / r);
    e.resize(i, a),
    Z.style.width = `${t}px`,
    Z.style.height = `${n}px`
}
function ar(e) {
    let t;
    try {
        t = i(e.data)
    } catch {
        throw new X(`That data.win couldn't be read. Pick the folder of an unmodified Undertale install.`)
    }
    if (t.displayName !== `UNDERTALE`)
        throw new X(`That folder holds "${t.displayName}", not Undertale.`);
    return t
}
function or() {
    return Q.hidden = !0,
    Z.hidden = !0,
    Xn.hidden = !1,
    Zn.focus(),
    Zn.addEventListener(`click`, () => Qn.click()),
    new Promise(e => {
        Qn.addEventListener(`change`, async () => {
            let t = [...Qn.files ?? []];
            if (Qn.value = ``,
            t.length) {
                Zn.disabled = !0,
                $n.textContent = `Reading data.win…`;
                try {
                    let {source: n, files: r} = await Fn(t)
                      , i = ar(n);
                    await In(r, e => {
                        $n.textContent = `Keeping a copy in this browser… ${Math.round(e * 100)}%`
                    }
                    ) || console.warn(`This browser will ask for the folder again next time.`),
                    Xn.hidden = !0,
                    Z.hidden = !1,
                    e({
                        source: n,
                        data: i
                    })
                } catch (e) {
                    e instanceof X || console.error(e),
                    $n.textContent = e instanceof X ? e.message : `Could not read that folder.`,
                    Zn.disabled = !1
                }
            }
        }
        )
    }
    )
}
async function sr() {
    try {
        let e = await Mn(e => {
            Q.textContent = `Loading data.win… ${Math.round(e * 100)}%`
        }
        );
        return {
            source: e,
            data: i(e.data)
        }
    } catch {}
    er.hidden = !1,
    Q.textContent = `Loading data.win…`;
    let e = await Pn();
    if (e)
        try {
            return {
                source: e,
                data: ar(e)
            }
        } catch {}
    return or()
}
async function cr() {
    if (!isSecureContext || !crypto.subtle)
        throw Error(`Open the game over https:// so saves can be signed.`);
    let {source: e, data: t} = await sr();
    He(t),
    Q.hidden = !1,
    Q.textContent = `Starting…`;
    let n = new et(Z,t)
      , r = Vn(t)
      , [i] = await Promise.all([ct.open(), n.loadPages(Hn(r))]);
    ir(n),
    addEventListener(`resize`, () => ir(n));
    let a = new ze(window), o = new Be(Z), s;
    $.value = String(nr());
    let c = () => {
        Jn.value = `${$.value}%`,
        Yn.classList.toggle(`muted`, $.value === `0`),
        Yn.title = `Volume: ${$.value}%`,
        s instanceof En && s.setVolume(rr(Number($.value)))
    }
    ;
    c(),
    $.addEventListener(`input`, c),
    $.addEventListener(`change`, () => {
        try {
            localStorage.setItem(tr, $.value)
        } catch {}
    }
    );
    for (let e of [`keydown`, `keyup`])
        $.addEventListener(e, e => e.stopPropagation());
    $.addEventListener(`pointerup`, () => $.blur());
    let l = () => {
        Kn.disabled = !(s instanceof En) && i.files.size === 0
    }
      , u = () => p.reset(i.hasProgress(), i.hasProgress(`new`))
      , d = r => {
        s = new En(n,t,e.musicUrl,i, () => {
            l(),
            u(),
            s = p
        }
        ,r,!1),
        c()
    }
      , f = async e => {
        try {
            await i.use(`imported`, await Ce(e, i.key)),
            l(),
            d(!0)
        } catch (e) {
            e instanceof b || console.error(e),
            p.say(e instanceof b ? e.message : `Could not read that folder.`, 255)
        }
    }
      , p = new Un(n,r,a,o,e => {
        e === `import` ? Gn.click() : e === `new` ? i.use(`new`, new Map).then( () => {
            l(),
            d(!1)
        }
        ) : d(!0)
    }
    );
    u(),
    s = p,
    Gn.addEventListener(`change`, () => {
        let e = [...Gn.files ?? []];
        Gn.value = ``,
        e.length && f(e)
    }
    ),
    er.addEventListener(`click`, async () => {
        er.disabled = !0,
        await Ln(),
        location.reload()
    }
    ),
    Kn.addEventListener(`click`, async () => {
        Kn.disabled = !0;
        try {
            let e = s instanceof En && s.saveNow();
            if (i.files.size === 0) {
                qn.textContent = `Nothing to export yet: walk around in the game first, then try again.`;
                return
            }
            let t = await Me(await Se(i.files, i.key));
            qn.textContent = e ? `Saved your current spot. ${t}` : t
        } catch (e) {
            e instanceof DOMException && e.name === `AbortError` || (console.error(e),
            qn.textContent = `Export failed: ${e instanceof Error ? e.message : String(e)}`)
        } finally {
            l();
            let e = qn.textContent;
            setTimeout( () => {
                qn.textContent === e && (qn.textContent = ``)
            }
            , 8e3)
        }
    }
    ),
    l(),
    Q.hidden = !0;
    let m = performance.now()
      , h = 0
      , g = e => {
        let t = s.frameMs ?? Wn;
        if (h = Math.min(h + e - m, t * 4),
        m = e,
        h >= t) {
            for (; h >= t; )
                s.update(),
                a.endFrame(),
                o.endFrame(),
                h -= t;
            n.begin(),
            s.draw(),
            n.end(),
            l()
        }
        requestAnimationFrame(g)
    }
    ;
    requestAnimationFrame(g)
}
Pe(),
Fe(),
cr().catch(e => {
    console.error(e),
    Q.hidden = !1,
    Q.textContent = `Could not start: ${e instanceof Error ? e.message : String(e)}`
}
);
