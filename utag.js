/**
 * Line by line utag.js breakdown. Work in progress as I encounter problems on each function.
 * If making edits please follow the JSDoc standard.
 * https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler
 *
 * Note:
 *     * I am using shorthand notation for prop values. str, arr, bol etc.
 *     * Inline logic code is differantiated from compiler code by using "//" instead.
 */

/**
 * Run Extensions scoped to “Pre-Loader”
 * Process Data Layer
 * Evaluate Load Rules
 * Run Extensions scoped to “All Tags”
 * Load Bundled Vendor Tags and Vendor Tags with their Wait Flag set to “Off”
 * Load Vendor Tags, their Extensions, and Mappings DOM Ready, DOM Ready scoped Extensions, and the Send Function
 * After Page Load: utag.view() and Advanced Configurations
 */
 
 var utag_condload = false;
 try {
    (function() {
        // utag script creation
        function ul(src, a, b) {
            a = document;
            b = a.createElement('script');
            b.language = 'javascript';
            b.type = 'text/javascript';
            b.src = src;
            a.getElementsByTagName('head')[0].appendChild(b);
        }
        if (('' + document.cookie).match('utag_env_services-mauricio_main=([^\S;]*)')) {
            if (RegExp.$1.indexOf('/prod/') === -1) {
                ul(RegExp.$1);
                utag_condload = true;
                __tealium_default_path = '//tags.tiqcdn.com/utag/services-mauricio/main/prod/';
            }
        }
    })();
} catch (e) {
    // mod: console.logging(e)
    console.log(e);
}

// This code determines whether or not utag is already defined. If utag is defined then all logic is skipped - this helps with sites that tag utag.js twice. If utag is undefined then all logic is ran.
if (typeof utag == 'undefined' && !utag_condload) {
    /** @type {obj} initialize utag.obj */
    var utag = {
        id: 'services-mauricio.main',
        o: {},

        sender: {},
        send: {},
        rpt: {
            ts: {
                a: new Date()
            }
        },
        dbi: [],
        db_log: [],
        loader: {
            q: [],
            lc: 0,
            f: {},
            p: 0,
            ol: 0,
            wq: [],
            lq: [],
            bq: {},
            bk: {},
            rf: 0,
            ri: 0,
            rp: 0,
            rq: [],
            ready_q: [],
            sendq: {
                'pending': 0
            },
            run_ready_q: function() {
                for (var i = 0; i < utag.loader.ready_q.length; i++) {
                    utag.DB('READY_Q:' + i);
                    try {
                        utag.loader.ready_q[i]();
                    } catch (e) {
                        utag.DB(e);
                    }
                }
            },
            /**
             * returns the location.hostname without the subdomain. e.g. tealium.com
             * checks if hostname ends on value.
             * @param  {str} a   :location.hostname
             * @param  {arr} b   :location.hostname split by (.)
             * @param  {bol} c   :check if a has any of the values in c
             * @return {str||[]} :returns the end of localhost || []
             */
             lh: function(a, b, c) {
                a = '' + location.hostname;
                b = a.split('.');
                c = (/\.co\.|\.com\.|\.org\.|\.edu\.|\.net\.|\.asn\./.test(a)) ? 3 : 2;
                return b.splice(b.length - c, c).join('.');
            },

            /**
             * Wait Queue:
             * responsible for determining the number of active tags - not just active tags that load on the page - that are part of the wait queue to be loaded at DOM Ready.
             * this picks up a utag_data items added after utag.js was loaded
             * Gotcha: Data layer set after utag.js will not overwrite something already set via an extension.  Only "new" values are copied from utag_data
             * for case where utag_data is set after utag.js is loaded
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             * @param {[type]} g [description]
             */
             WQ: function(a, b, c, d, g) {
                utag.DB('WQ:' + utag.loader.wq.length);
                try {
                    // check if udoname prop is set as utag_data;
                    // pull that info into utag.data
                    if (utag.udoname && utag.udoname.indexOf('.') < 0) {
                        utag.ut.merge(utag.data, window[utag.udoname], 0);
                    }
                    // TBD: utag.handler.RE('view',utag.data,"bwq")
                    // process load rules again if this flag is set
                    if (utag.cfg.load_rules_at_wait) {
                        // call loadrules and pass utag.data as b.
                        utag.handler.LR(utag.data);
                    }
                } catch (e) {
                    utag.DB(e);
                }
                d = 0;
                g = [];
                for (a = 0; a < utag.loader.wq.length; a++) {
                    b = utag.loader.wq[a];
                    b.load = utag.loader.cfg[b.id].load;
                    if (b.load == 4) {
                        // LOAD the bundled tag set to wait here
                        this.f[b.id] = 0;
                        utag.loader.LOAD(b.id);
                    } else if (b.load > 0) {
                        g.push(b);
                        // utag.loader.AS(b);
                        // moved: defer loading until flags cleared
                        d++;
                    } else {
                        // clear flag for those set to wait that were not actually loaded
                        this.f[b.id] = 1;
                    }
                }
                for (a = 0; a < g.length; a++) {
                    utag.loader.AS(g[a]);
                }
                if (d == 0) {
                    utag.loader.END();
                }
            },

            /**
             * Add Script: responsible for injecting vendor tags into the page source code - handles scripts, iframes, and pixels.
             * make network calls for non-bundled tags
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             */
             AS: function(a, b, c, d) {
                utag.send[a.id] = a;
                if (typeof a.src == 'undefined') {
                    a.src = utag.cfg.path + ((typeof a.name != 'undefined') ? a.name : 'ut' + 'ag.' + a.id + '.js');
                }
                a.src += (a.src.indexOf('?') > 0 ? '&' : '?') + 'utv=' + (a.v ? utag.cfg.template + a.v : utag.cfg.v);
                utag.rpt['l_' + a.id] = a.src;
                b = document;
                this.f[a.id] = 0;
                if (a.load == 2) {
                    utag.DB('Attach sync: ' + a.src);
                    a.uid = a.id;
                    b.write('<script id="utag_' + a.id + '" src="' + a.src + '"></scr' + 'ipt>');
                    if (typeof a.cb != 'undefined')
                        a.cb();
                } else if (a.load == 1 || a.load == 3) {
                    if (b.createElement) {
                        c = 'utag_services-mauricio.main_' + a.id;
                        if (!b.getElementById(c)) {
                            d = {
                                src: a.src,
                                id: c,
                                uid: a.id,
                                loc: a.loc
                            };
                            if (a.load == 3) {
                                d.type = 'iframe';
                            }
                            if (typeof a.cb != 'undefined') {
                                d.cb = a.cb;
                            }
                            utag.ut.loader(d);
                        }
                    }
                }
            },

            /**
             *  Get Value - responsible for verifying data and ensuring variables are not of type function.
             * create local b object for each tag
             * @param {obj} a [description]
             * @param {obj} b [description]
             * @param {str} c [description]
             */
             GV: function(a, b, c) {
                b = {};
                // copy properties in a obj passed to function
                for (c in a) {
                    if (a.hasOwnProperty(c) && typeof a[c] != 'function')
                        b[c] = a[c];
                }
                return b;
            },

            /**
             * [OU description]
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             * @param {[type]} f [description]
             */
             OU: function(a, b, c, d, f) {
                utag.loader.EV
                try {
                    if (typeof utag.data['cp.OPTOUTMULTI'] != 'undefined') {
                        c = utag.loader.cfg;
                        a = utag.ut.decode(utag.data['cp.OPTOUTMULTI']).split('|');
                        for (d = 0; d < a.length; d++) {
                            b = a[d].split(':');
                            if (b[1] * 1 !== 0) {
                                if (b[0].indexOf('c') == 0) {
                                    for (f in utag.loader.GV(c)) {
                                        if (c[f].tcat == b[0].substring(1))
                                            c[f].load = 0;
                                    }
                                } else if (b[0] * 1 == 0) {
                                    utag.cfg.nocookie = true;
                                } else {
                                    for (f in utag.loader.GV(c)) {
                                        if (c[f].tid == b[0])
                                            c[f].load = 0;
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    utag.DB(e);
                }
            },

            /**
             * ReadDOM.
             * set dom variables.
             * @param {obj} o :object with dom values.
             */
             RDdom: function(o) {
                var d = document || {},
                l = location || {};
                o['dom.referrer'] = d.referrer;
                o['dom.title'] = '' + d.title;
                o['dom.domain'] = '' + l.hostname;
                o['dom.query_string'] = ('' + l.search).substring(1);
                o['dom.hash'] = ('' + l.hash).substring(1);
                o['dom.url'] = '' + d.URL;
                o['dom.pathname'] = '' + l.pathname;
                o['dom.viewport_height'] = window.innerHeight || (d.documentElement ? d.documentElement.clientHeight : 960);
                o['dom.viewport_width'] = window.innerWidth || (d.documentElement ? d.documentElement.clientWidth : 960);
            },

            /**
             * Read: Cookie Params.
             * b obj breaking up into individual variables.
             * @param {[type]} o [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             */
             RDcp: function(o, b, c, d) {
                // read cookie params
                b = utag.loader.RC();
                // good point to check u.map
                for (d in b) {
                    // if we're working with utag_data;
                    if (d.match(/utag_(.*)/)) {
                        // loop and check data is not a function
                        for (c in utag.loader.GV(b[d])) {
                            // add local cookieparams prefix 'cp_utag'
                            o['cp.utag_' + RegExp.$1 + '_' + c] = b[d][c];
                        }
                    }
                }
                for (c in utag.loader.GV((utag.cl && !utag.cl['_all_']) ? utag.cl : b)) {
                    if (c.indexOf('utag_') < 0 && typeof b[c] != 'undefined') {
                        o['cp.' + c] = b[c];
                    }
                }
                // o["_t_visitor_id"]=o["cp.utag_main_v_id"]
                // o["_t_session_id"]=o["cp.utag_main_ses_id"]
            },

            /**
             * Read Query Parameters.
             * @param {[type]} o [description]
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             */
             RDqp: function(o, a, b, c) {
                a = location.search + (location.hash + '').replace('#', '&');
                if (utag.cfg.lowerqp) {
                    a = a.toLowerCase();
                }
                if (a.length > 1) {
                    b = a.substring(1).split('&');
                    for (a = 0; a < b.length; a++) {
                        c = b[a].split('=');
                        if (c.length > 1) {
                            o['qp.' + c[0]] = utag.ut.decode(c[1]);
                        }
                    }
                }
            },

            /**
             * set meta page variables.
             * @param {[type]} o [description]
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} h [description]
             */
             RDmeta: function(o, a, b, h) {
                a = document.getElementsByTagName('meta');
                for (b = 0; b < a.length; b++) {
                    try {
                        h = a[b].name || a[b].getAttribute('property') || '';
                    } catch (e) {
                        h = '';
                        utag.DB(e);
                    }
                    if (utag.cfg.lowermeta) {
                        h = h.toLowerCase();
                    }
                    if (h != '') {
                        o['meta.' + h] = a[b].content;
                    }
                }
            },

            /**
             * Upon a visitors first visit to a website, the Tealium library will check to see if the v_id exists within the utag_main cookie. If v_id does not exist the Tealium library will create it and store in the utag_main cookie. If v_id does exist, the Tealium library will proceed to use the current v_id value.
             */

            /**
             * read localstorage
             * @param {[type]} o [description]
             */
             RDva: function(o) {
                /**
                 * Read visitor attributes in local storage
                 * @param  {[type]} o [description]
                 * @param  {[type]} l [description]
                 * @return {[type]}   [description]
                 */
                 var readAttr = function(o, l) {
                    var a = '',
                    b;
                    a = localStorage.getItem(l);
                    if (!a || a == '{}') {
                        return;
                    }
                    b = utag.ut.flatten({
                        va: JSON.parse(a)
                    });
                    utag.ut.merge(o, b, 1);
                };
                try {
                    readAttr(o, 'tealium_va');
                    readAttr(o, 'tealium_va_' + o['ut.account'] + '_' + o['ut.profile']);
                } catch (e) {
                    utag.DB(e);
                }
            },

            /**
             * Add built-in data types to the data layer for use in mappings, extensions and RDva function.
             * @param {[type]} o [description]
             * @param {[type]} a [description]
             */
             RDut: function(o, a) {
                o['ut.domain'] = utag.cfg.domain;
                o['ut.version'] = utag.cfg.v;
                // i.e. "view" or "link"
                o['ut.event'] = a || 'view';
                o['ut.visitor_id'] = o['cp.utag_main_v_id'];
                o['ut.session_id'] = o['cp.utag_main_ses_id'];
                try {
                    o['ut.account'] = utag.cfg.utid.split('/')[0];
                    o['ut.profile'] = utag.cfg.utid.split('/')[1];
                    o['ut.env'] = utag.cfg.path.split('/')[6];
                } catch (e) {
                    utag.DB(e);
                }
            },

            /**
             * [RDses description]
             * @param {[type]} o [description]
             * @param {[type]} a [description]
             * @param {[type]} c [description]
             */
             RDses: function(o, a, c) {
                a = (new Date()).getTime();
                c = (a + parseInt(utag.cfg.session_timeout)) + '';
                // cp.utag_main_ses_id will not be in the data layer when it has expired or this is first page view of all time
                if (!o['cp.utag_main_ses_id']) {
                    o['cp.utag_main_ses_id'] = a + '';
                    o['cp.utag_main__ss'] = '1';
                    o['cp.utag_main__sn'] = (1 + parseInt(o['cp.utag_main__sn'] || 0)) + '';
                } else {
                    o['cp.utag_main__ss'] = '0';
                }
                o['cp.utag_main__pn'] = o['cp.utag_main__pn'] || '1';
                o['cp.utag_main__st'] = c;
                utag.loader.SC('utag_main', {
                    '_sn': (o['cp.utag_main__sn'] || 1),
                    '_ss': o['cp.utag_main__ss'],
                    '_st': c,
                    'ses_id': (o['cp.utag_main_ses_id'] || a) + ';exp-session',
                    '_pn': o['cp.utag_main__pn'] + ';exp-session'
                });
            },

            /**
             * read page variables function
             * @param {[type]} o [description]
             */
             RDpv: function(o) {
                if (typeof utag.pagevars == 'function') {
                    utag.DB('Read page variables');
                    utag.pagevars(o);
                }
            },

            /**
             * Read Data:
             * responsible for managing the reading of meta data, query string parameters, site cookies, utag cookies, and DOM elements.
             * @param {obj} o [description]
             * @param {obj} a [description]
             */
             RD: function(o, a) {
                utag.DB('utag.loader.RD');
                utag.DB(o);
                utag.loader.RDcp(o);
                if (!utag.loader.rd_flag) {
                    utag.loader.rd_flag = 1;
                    o['cp.utag_main_v_id'] = o['cp.utag_main_v_id'] || utag.ut.vi((new Date()).getTime());
                    o['cp.utag_main__pn'] = (1 + parseInt(o['cp.utag_main__pn'] || 0)) + '';
                    // the _st value is not-yet-set for first page view so we'll need wait to write in _pn value (which is exp-session)
                    // The SC function expires (removes) cookie values that expired with the session
                    utag.loader.SC('utag_main', {
                        'v_id': o['cp.utag_main_v_id']
                    });
                    utag.loader.RDses(o);
                }
                // first utag.track call for noview should not clear session start (_ss) value
                if (a && !utag.cfg.noview) {
                    utag.loader.RDses(o);
                }
                utag.loader.RDqp(o);
                utag.loader.RDmeta(o);
                utag.loader.RDdom(o);
                utag.loader.RDut(o, a || 'view');
                utag.loader.RDpv(o);
                utag.loader.RDva(o);
            },

            /**
             * Read Cookie: parse utag.cookie.
             * @param {[type]} a  [description]
             * @param {[type]} x  [description]
             * @param {str} b     :"utag_main=v_id:015703cfc3fc0016a350be0ce0b205077001606f0093c$_sn:1$_ss:1$_st:1473239530301$ses_id:1473237730301%3Bexp-session$_pn:1%3Bexp-session"
             * @param {int} c     :for loop counter
             * @param {[type]} d  :description
             * @param {arr} e  :decoded cv split into array.
             * @param {int} f  :local loop int || key in loop
             * @param {arr} g  :["v_id", "015703cfc3fc0016a350be0ce0b205077001606f0093c"]
             * @param {[type]} h  [description]
             * @param {[type]} i  [description]
             * @param {arr} j  :cv split [] or {obj} with cv props.
             * @param {[type]} k  [description]
             * @param {[type]} l  [description]
             * @param {[type]} m  [description]
             * @param {[type]} n  [description]
             * @param {obj} o  : utag_main
             * @param {[type]} v  [description]
             * @param {str} ck : "utag.main"
             * @param {str} cv : "v_id:015703cfc3fc0016a350be0ce0b205077001606f0093c$_sn:1$_ss:1$_st:1473239530301$ses_id:1473237730301%3Bexp-session$_pn:1%3Bexp-session"
             * @param {reg} r  :/^(.*?)=(.*)$/ match any character, lazy, literal '=' followed by any char till end of line
             * @param {reg} s  :/^(.*);exp-(.*)$/
             * @param {dat} t  :timestamp
             */
             RC: function(a, x, b, c, d, e, f, g, h, i, j, k, l, m, n, o, v, ck, cv, r, s, t) {
                o = {};
                b = ('' + document.cookie != '') ? (document.cookie).split('; ') : [];
                r = /^(.*?)=(.*)$/;
                s = /^(.*);exp-(.*)$/;
                t = (new Date()).getTime();
                for (c = 0; c < b.length; c++) {
                    if (b[c].match(r)) {
                        ck = RegExp.$1;
                        cv = RegExp.$2;
                    }
                    // decode componets of cv
                    e = utag.ut.decode(cv);

                    if (typeof ck != 'undefined') {
                        // arr.indexOf(searchElement[, fromIndex = 0])
                        if (ck.indexOf('ulog') == 0 || ck.indexOf('utag_') == 0) {
                            e = cv.split('$');
                            g = [];
                            j = {};
                            for (f = 0; f < e.length; f++) {
                                try {
                                    g = e[f].split(':');
                                    if (g.length > 2) {
                                        g[1] = g.slice(1).join(':');
                                    }
                                    v = '';
                                    if (('' + g[1]).indexOf('~') == 0) {
                                        h = g[1].substring(1).split('|');
                                        for (i = 0; i < h.length; i++)
                                            h[i] = utag.ut.decode(h[i]);
                                        v = h;
                                    } else
                                    v = utag.ut.decode(g[1]);
                                    j[g[0]] = v;
                                } catch (er) {
                                    utag.DB(er);
                                }
                            }
                            // o.utag_main.
                            o[ck] = {};
                            for (f in utag.loader.GV(j)) {
                                // f "v_id"
                                if (j[f] instanceof Array) {
                                    n = [];
                                    for (m = 0; m < j[f].length; m++) {
                                        if (j[f][m].match(s)) {
                                            k = (RegExp.$2 == 'session') ? (typeof j._st != 'undefined' ? j._st : t - 1) : parseInt(RegExp.$2);
                                            if (k > t)
                                                n[m] = (x == 0) ? j[f][m] : RegExp.$1;
                                        }
                                    }
                                    j[f] = n.join('|');
                                } else {
                                    j[f] = '' + j[f];
                                    if (j[f].match(s)) {
                                        k = (RegExp.$2 == 'session') ? (typeof j._st != 'undefined' ? j._st : t - 1) : parseInt(RegExp.$2);
                                        j[f] = (k < t) ? null : (x == 0 ? j[f] : RegExp.$1);
                                    }
                                }
                                if (j[f])
                                    o[ck][f] = j[f];
                            }
                        } else if (utag.cl[ck] || utag.cl['_all_']) {
                            o[ck] = e;
                        }
                    }
                }
                // a = 'undefined', o={"v_id": "015703cfc3fc0016a350be0ce0b205077001606f0093c","_sn": "1","_ss": "1","_st": "1473239530301","ses_id": "1473237730301","_pn": "1"}
                return (a) ? (o[a] ? o[a] : {}) : o;
            },

            /**
             * SetCookie: Sets cookies and exparations dates.
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             * @param {[type]} e [description]
             * @param {[type]} f [description]
             * @param {[type]} g [description]
             * @param {[type]} h [description]
             * @param {[type]} i [description]
             * @param {[type]} j [description]
             * @param {[type]} k [description]
             * @param {[type]} x [description]
             * @param {[type]} v [description]
             */
             SC: function(a, b, c, d, e, f, g, h, i, j, k, x, v) {
                if (!a) 
                    return 0;
                if (a == 'utag_main' && utag.cfg.nocookie)
                    return 0;
                v = '';
                var date = new Date();
                var exp = new Date();
                exp.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
                x = exp.toGMTString();
                if (c && c == 'da') {
                    x = 'Thu, 31 Dec 2009 00:00:00 GMT';
                } else if (a.indexOf('utag_') != 0 && a.indexOf('ulog') != 0) {
                    if (typeof b != 'object') {
                        v = b;
                    }
                } else {
                    d = utag.loader.RC(a, 0);
                    for (e in utag.loader.GV(b)) {
                        f = '' + b[e];
                        if (f.match(/^(.*);exp-(\d+)(\w)$/)) {
                            g = date.getTime() + parseInt(RegExp.$2) * ((RegExp.$3 == 'h') ? 3600000 : 86400000);
                            if (RegExp.$3 == 'u')
                                g = parseInt(RegExp.$2);
                            f = RegExp.$1 + ';exp-' + g;
                        }
                        if (c == 'i') {
                            if (d[e] == null)
                                d[e] = f;
                        } else if (c == 'd')
                        delete d[e];
                        else if (c == 'a')
                            d[e] = (d[e] != null) ? (f - 0) + (d[e] - 0) : f;
                        else if (c == 'ap' || c == 'au') {
                            if (d[e] == null)
                                d[e] = f;
                            else {
                                if (d[e].indexOf('|') > 0) {
                                    d[e] = d[e].split('|');
                                }
                                g = (d[e] instanceof Array) ? d[e] : [d[e]];
                                g.push(f);
                                if (c == 'au') {
                                    h = {};
                                    k = {};
                                    for (i = 0; i < g.length; i++) {
                                        if (g[i].match(/^(.*);exp-(.*)$/)) {
                                            j = RegExp.$1;
                                        }
                                        if (typeof k[j] == 'undefined') {
                                            k[j] = 1;
                                            h[g[i]] = 1;
                                        }
                                    }
                                    g = [];
                                    for (i in utag.loader.GV(h)) {
                                        g.push(i);
                                    }
                                }
                                d[e] = g;
                            }
                        } else
                        d[e] = f;
                    }
                    h = [];
                    for (g in utag.loader.GV(d)) {
                        if (d[g] instanceof Array) {
                            for (c = 0; c < d[g].length; c++) {
                                d[g][c] = encodeURIComponent(d[g][c]);
                            }
                            h.push(g + ':~' + d[g].join('|'));
                        } else
                        h.push((g + ':').replace(/[\,\$\;\?]/g, '') + encodeURIComponent(d[g]));
                    }
                    if (h.length == 0) {
                        h.push('');
                        x = '';
                    }
                    v = (h.join('$'));
                }
                document.cookie = a + '=' + v + ';path=/;domain=' + utag.cfg.domain + ';expires=' + x;
                return 1;
            },

            /**
             * Load:
             * responsible for firing the utag libraries.
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             */
             LOAD: function(a, b, c, d) {
                // utag.DB('utag.loader.LOAD:' + a)
                // check that loader logic is in place.
                if (!utag.loader.cfg) {
                    return;
                }
                if (this.ol == 0) {
                    if (utag.loader.cfg[a].block && utag.loader.cfg[a].cbf) {
                        this.f[a] = 1
                        delete utag.loader.bq[a];
                    }
                    for (b in utag.loader.GV(utag.loader.bq)) {
                        if (utag.loader.cfg[a].load == 4 && utag.loader.cfg[a].wait == 0) {
                            utag.loader.bk[a] = 1;
                            utag.DB('blocked: ' + a);
                        }
                        utag.DB('blocking: ' + b);
                        return;
                    }
                    utag.loader.INIT();
                    return;
                }
                utag.DB('utag.loader.LOAD:' + a);
                if (this.f[a] == 0) {
                    this.f[a] = 1;
                    if (utag.cfg.noview != true) {
                        if (utag.loader.cfg[a].send) {
                            utag.DB('SENDING: ' + a);
                            try {
                                if (utag.loader.sendq.pending > 0 && utag.loader.sendq[a]) {
                                    utag.DB('utag.loader.LOAD:sendq: ' + a);
                                    while ((d = utag.loader.sendq[a].shift())) {
                                        utag.DB(d);
                                        utag.sender[a].send(d.event, utag.handler.C(d.data));
                                        utag.loader.sendq.pending--;
                                    }
                                } else {
                                    utag.sender[a].send('view', utag.handler.C(utag.data));
                                }
                                utag.rpt['s_' + a] = 0;
                            } catch (e) {
                                utag.DB(e);
                                utag.rpt['s_' + a] = 1;
                            }
                        }
                    }
                    if (utag.loader.rf == 0) {
                        return;
                    }
                    for (b in utag.loader.GV(this.f)) {
                        if (this.f[b] == 0 || this.f[b] == 2)
                            return;
                    }
                    utag.loader.END();
                }
            },

            /**
             * Event: responsible for managing the DOM state and any code dependent on the DOM state. called during loading phase. find and map utag.data.  contains all Extensions scoped to DOM Ready.
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {fnc} c   [description]
             * @param {[type]} d [description]
             */
             EV: function(a, b, c, d) {
                if (b == 'ready') {
                    // may be called if no udo variables defined.
                    // try and find utag.data if not then try and map it?
                    if (!utag.data) {
                        try {
                            utag.cl = {
                                '_all_': 1
                            };
                            // call init data function
                            utag.loader.initdata();
                            utag.loader.RD(utag.data);
                        } catch (e) {
                            utag.DB(e);
                        }
                    }
                    if ((document.attachEvent || utag.cfg.dom_complete) ? document.readyState === 'complete' : document.readyState !== 'loading')
                    // setTimeout(func, [delay, param1, param2, ...])
                    // Calls a function or executes a code snippet after a specified delay.
                    setTimeout(c, 1);
                    else {
                        utag.loader.ready_q.push(c);
                        var RH;
                        if (utag.loader.ready_q.length <= 1) {
                            if (document.addEventListener) {
                                /**
                                 * [RH description]
                                 */
                                 RH = function() {
                                    // target.removeEventListener(type, listener[, useCapture])
                                    document.removeEventListener('DOMContentLoaded', RH, false);
                                    utag.loader.run_ready_q();
                                };
                                if (!utag.cfg.dom_complete) {
                                    // target.addEventListener(type, listener[, useCapture])
                                    document.addEventListener('DOMContentLoaded', RH, false);
                                }
                                window.addEventListener('load', utag.loader.run_ready_q, false);
                            } else if (document.attachEvent) {
                                RH = function() {
                                    if (document.readyState === 'complete') {
                                        document.detachEvent('onreadystatechange', RH);
                                        utag.loader.run_ready_q();
                                    }
                                };
                                document.attachEvent('onreadystatechange', RH);
                                window.attachEvent('onload', utag.loader.run_ready_q);
                            }
                        }
                    }
                } else {
                    if (a.addEventListener) {
                        a.addEventListener(b, c, false);
                    } else if (a.attachEvent) {
                        a.attachEvent(((d == 1) ? '' : 'on') + b, c);
                    }
                }
            },

            /**
             * [END description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             * @param {[type]} d [description]
             * @param {[type]} e [description]
             * @param {[type]} v [description]
             * @param {[type]} w [description]
             */
             END: function(b, c, d, e, v, w) {
                if (this.ended) {
                    return;
                }
                this.ended = 1;
                utag.DB('loader.END');
                b = utag.data;
                // add the default values for future utag.link/view calls
                if (utag.handler.base && utag.handler.base != '*') {
                    e = utag.handler.base.split(',');
                    for (d = 0; d < e.length; d++) {
                        if (typeof b[e[d]] != 'undefined')
                            utag.handler.df[e[d]] = b[e[d]];
                    }
                } else if (utag.handler.base == '*') {
                    utag.ut.merge(utag.handler.df, b, 1);
                }
                utag.rpt['r_0'] = 't';
                for (var r in utag.loader.GV(utag.cond)) {
                    utag.rpt['r_' + r] = (utag.cond[r]) ? 't' : 'f';
                }
                utag.rpt.ts['s'] = new Date();
                v = '.tiqcdn.com';
                w = utag.cfg.path.indexOf(v);
                if (w > 0 && b['cp.utag_main__ss'] == 1 && !utag.cfg.no_session_count)
                    utag.ut.loader({
                        src: utag.cfg.path.substring(0, w) + v + '/ut' + 'ag/tiqapp/ut' + 'ag.v.js?a=' + utag.cfg.utid + (utag.cfg.nocookie ? '&nocookie=1' : '&cb=' + (new Date).getTime()),
                        id: 'tiqapp'
                    });
                if (utag.cfg.noview != true)
                    utag.handler.RE('view', b, 'end');
                utag.handler.INIT();
            }
        },

        /**
         * Debug: responsible for outputting current status to the console log, as well as firing Tag Watch emails. to enable: document.cookie="utagdb=true"
         * @param {str} a :passed to DB function from caller. Usually the caller.
         * @param {[type]} b [description]
         */
         DB: function(a, b) {
            // return right away if we've already checked the cookie
            if (utag.cfg.utagdb === false) {
                return;
            } else if (typeof utag.cfg.utagdb == 'undefined') {
                b = document.cookie + '';
                utag.cfg.utagdb = ((b.indexOf('utagdb=true') >= 0) ? true : false);
            }
            if (utag.cfg.utagdb === true) {
                var t;
                if (utag.ut.typeOf(a) == 'object') {
                    t = utag.handler.C(a);
                } else {
                    t = a;
                }
                utag.db_log.push(t);
                try {
                    if (!utag.cfg.noconsole)
                        console.log(t);
                } catch (e) {}
            }
        },

        /**
         * Report: responsible for firing off the image request containing all errors recorded by DB.
         * @param {[type]} a [description]
         * @param {[type]} b [description]
         * @param {[type]} c [description]
         */
         RP: function(a, b, c) {
            if (typeof a != 'undefined' && typeof a.src != 'undefined' && a.src != '') {
                b = [];
                for (c in utag.loader.GV(a)) {
                    if (c != 'src')
                        b.push(c + '=' + escape(a[c]));
                }
                this.dbi.push((new Image()).src = a.src + '?utv=' + utag.cfg.v + '&utid=' + utag.cfg.utid + '&' + (b.join('&')));
            }
        },

        /**
         * view: method for tracking dynmic load content. PageView. call should exist in the dynamic content loaded within the page. do not call this method on a static page load. Even if the page load has dynamic content from an include file on page load,  the use of these calls is incorrect since the dynamic content is placed on page load. ex:  utag.view({ page:'product quick view', section:'products', product:'Tealium iQ', event:'add to cart' })
         * 
         * commonly used for ajax page flows where the url does not refresh as the user navigates. i.e. (accordion checkout, single page application).
         * 
         * utag_data is not repurposed with these calls. You must manually pass the data obj.
         * 
         * Utag.js automatically triggers this function on pageload.
         * 
         * If your website loads utag.js only once per visit, and thus must manually trigger page views, you willsuppress the automatic page tracking to allow for custom tracking of the page. The Universal Tag alllows you to override certain behaviors via a global object named "window.utag_cfg_ovrd". To override the automatic page tracking add this line to your page prior to loading utag.js: window.utag_cfg_ovrd = {noview : true};
         * 
         * 
         * @param  {obj} a :JSON obj w data.
         * @param  {fun} c :a callback function (optional).
         * @param  {arr} d :an array of Tags (optional: if used, these are the only Tags that will fire).
         */
         view: function(a, c, d) {
            return this.track({
                event: 'view',
                data: a,
                cfg: {
                    cb: c,
                    uids: d
                }
            });
        },

        /**
         * to trigger a link click call the utag.link() method.
         * 
         * triggers a non-pageview event
         * 
         * best-practice: use variable 'event_name' to control tag behavior.
         * 
         * event_name: variable used to uniquely identify interaction that is tracked on site. This variable can be used through the tiq interface to configure load rules, extensions and data-mappings.
         * 
         * best-practice: event-name:
         *     cart_add, cart_remove, cart_empty, cart_view, user_register, user_login, user_logout, custom_click.
         * 
         * @param  {obj} a :JSON obj w/data.
         * @param  {fnc} c :optional cb().
         * @param  {arr} d :array of tags to load.
         * @method
         */
         link: function(a, c, d) {
            return this.track({
                event: 'link',
                data: a,
                cfg: {
                    cb: c,
                    uids: d
                }
            });
        },

        /**
         * triggered from utag.view() or utag.link()
         * @param  {str} a :typeof 'event', "view" or "link".
         * @param  {obj} b data passed to function.
         * @param  {fun} c :callback function.
         * @param  {str} d :key in loadrules.
         * @return {bol}   :returns true if succesfully fired.
         */
         track: function(a, b, c, d) {
            if (typeof a == 'string') {
                a = {
                    event: a,
                    data: b,
                    cfg: {
                        cb: c
                    }
                };
            }
            for (d in utag.loader.GV(utag.o)) {
                try {
                    utag.o[d].handler.trigger(a.event || 'view', a.data || a, a.cfg);
                } catch (e) {
                    utag.DB(e);
                }
            }
            if (a.cfg && a.cfg.cb) {
                try {
                    a.cfg.cb();
                } catch (e) {
                    utag.DB(e);
                }
            }
            return true;
        },
        handler: {
            base: '',
            df: {},
            o: {},
            send: {},
            iflag: 0,

            /**
             * standard utag.js file logic is initiated
             * Passes the type of event (either a view or link event) and the utag.data object as parameters to the utag.handler.trigger function. The type of event is passed to the trigger method as the 'a' object, and the utag.data object is passed to the trigger method as the 'b' object.
             * Also runs the 'All Tags'-scoped Extensions.
             * First instantiation of tbe b obj.
             *
             * @param {obj} a :event type.
             * @param {obj} b :utag.data reference.
             * @param {[type]} c [description]
             */
             INIT: function(a, b, c) {
                var unknown = {
                    'id': 'services-mauricio.main',
                    'o': {},
                    'sender': {},
                    'send': {},
                    'rpt': {
                        'ts': {
                            'a': '2016-09-07T08:07:17.786Z',
                            'i': '2016-09-07T08:07:17.796Z',
                            's': '2016-09-07T08:07:17.796Z'
                        },
                        'r_0': 't'
                    },
                    'dbi': [],
                    'db_log': [],
                    'loader': {
                        'q': [],
                        'lc': 0,
                        'f': {},
                        'p': 0,
                        'ol': 1,
                        'wq': [],
                        'lq': [],
                        'bq': {},
                        'bk': {},
                        'rf': 1,
                        'ri': 0,
                        'rp': 0,
                        'rq': [],
                        'ready_q': [],
                        'sendq': {
                            'pending': 0
                        },

                        /**
                         * [description]
                         * @return {[type]} [description]
                         */
                         'run_ready_q': function() {
                            for (var i = 0; i < utag.loader.ready_q.length; i++) {
                                utag.DB('READY_Q:' + i);
                                try {
                                    utag.loader.ready_q[i]();
                                } catch (e) {
                                    utag.DB(e);
                                }
                            }
                        },

                        /**
                         * [description]
                         * @param  {str} a:
                         * @param  {obj} b:
                         * @param  {num} c:
                         * @return {str}
                         */
                         'lh': function(a, b, c) {
                            a = '' + location.hostname;
                            b = a.split('.');
                            c = (/\.co\.|\.com\.|\.org\.|\.edu\.|\.net\.|\.asn\./.test(a)) ? 3 : 2;
                            return b.splice(b.length - c, c).join('.');
                        },

                        /**
                         * Tags Wait Queue.
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {[type]} c [description]
                         * @param  {[type]} d [description]
                         * @param  {[type]} g [description]
                         * @return {[type]}   [description]
                         */
                         'WQ': function(a, b, c, d, g) {
                            utag.DB('WQ:' + utag.loader.wq.length);
                            try {
                                // this picks up a utag_data items added after utag.js was loaded
                                // Gotcha: Data layer set after utag.js will not overwrite something already set via an extension.  Only "new" values are copied from utag_data
                                // for case where utag_data is set after utag.js is loaded
                                if (utag.udoname && utag.udoname.indexOf('.') < 0) {
                                    utag.ut.merge(utag.data, window[utag.udoname], 0);
                                }

                                // TBD: utag.handler.RE('view',utag.data,"bwq")
                                // process load rules again if this flag is set
                                if (utag.cfg.load_rules_at_wait) {
                                    utag.handler.LR(utag.data);
                                }
                            } catch (e) {
                                utag.DB(e);
                            }

                            d = 0;
                            g = [];
                            for (a = 0; a < utag.loader.wq.length; a++) {
                                b = utag.loader.wq[a];
                                b.load = utag.loader.cfg[b.id].load;
                                if (b.load == 4) {
                                    // LOAD the bundled tag set to wait here
                                    this.f[b.id] = 0;
                                    utag.loader.LOAD(b.id);
                                } else if (b.load > 0) {
                                    g.push(b);
                                    // utag.loader.AS(b); // moved: defer loading until flags cleared
                                    d++;
                                } else {
                                    // clear flag for those set to wait that were not actually loaded
                                    this.f[b.id] = 1;
                                }
                            }
                            for (a = 0; a < g.length; a++) {
                                utag.loader.AS(g[a]);
                            }

                            if (d == 0) {
                                utag.loader.END();
                            }
                        },

                        /**
                         * Attach Script.
                         *
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {[type]} c [description]
                         * @param  {[type]} d [description]
                         *
                         * @return {[type]}   [description]
                         */
                         'AS': function(a, b, c, d) {
                            utag.send[a.id] = a;
                            if (typeof a.src == 'undefined') {
                                a.src = utag.cfg.path + ((typeof a.name != 'undefined') ? a.name : 'ut' + 'ag.' + a.id + '.js');
                            }
                            a.src += (a.src.indexOf('?') > 0 ? '&' : '?') + 'utv=' + (a.v ? utag.cfg.template + a.v : utag.cfg.v);
                            //////////////////
                            // utag report  //
                            //////////////////
                            utag.rpt['l_' + a.id] = a.src;
                            b = document;
                            this.f[a.id] = 0;
                            if (a.load == 2) {
                                utag.DB('Attach sync: ' + a.src);
                                a.uid = a.id;
                                b.write('<script id="utag_' + a.id + '" src="' + a.src + '"></scr' + 'ipt>');
                                if (typeof a.cb != 'undefined') {
                                    a.cb();
                                }
                            } else if (a.load == 1 || a.load == 3) {
                                if (b.createElement) {
                                    c = 'utag_services-mauricio.main_' + a.id;
                                    if (!b.getElementById(c)) {
                                        d = {
                                            src: a.src,
                                            id: c,
                                            uid: a.id,
                                            loc: a.loc
                                        };
                                        if (a.load == 3) {
                                            d.type = 'iframe';
                                        }
                                        if (typeof a.cb != 'undefined') d.cb = a.cb;
                                        utag.ut.loader(d);
                                    }
                                }
                            }
                        },
                        'GV': function(a, b, c) {
                            b = {};
                            for (c in a) {
                                if (a.hasOwnProperty(c) && typeof a[c] != 'function') b[c] = a[c];
                            }
                            return b;
                        },
                        'OU': function(a, b, c, d, f) {
                            try {
                                if (typeof utag.data['cp.OPTOUTMULTI'] != 'undefined') {
                                    c = utag.loader.cfg;
                                    a = utag.ut.decode(utag.data['cp.OPTOUTMULTI']).split('|');
                                    for (d = 0; d < a.length; d++) {
                                        b = a[d].split(':');
                                        if (b[1] * 1 !== 0) {
                                            if (b[0].indexOf('c') == 0) {
                                                for (f in utag.loader.GV(c)) {
                                                    if (c[f].tcat == b[0].substring(1)) c[f].load = 0;
                                                }
                                            } else if (b[0] * 1 == 0) {
                                                utag.cfg.nocookie = true;
                                            } else {
                                                for (f in utag.loader.GV(c)) {
                                                    if (c[f].tid == b[0]) c[f].load = 0;
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                utag.DB(e);
                            }
                        },
                        'RDdom': function(o) {
                            var d = document || {},
                            l = location || {};
                            o['dom.referrer'] = d.referrer;
                            o['dom.title'] = '' + d.title;
                            o['dom.domain'] = '' + l.hostname;
                            o['dom.query_string'] = ('' + l.search).substring(1);
                            o['dom.hash'] = ('' + l.hash).substring(1);
                            o['dom.url'] = '' + d.URL;
                            o['dom.pathname'] = '' + l.pathname;
                            o['dom.viewport_height'] = window.innerHeight || (d.documentElement ? d.documentElement.clientHeight : 960);
                            o['dom.viewport_width'] = window.innerWidth || (d.documentElement ? d.documentElement.clientWidth : 960);
                        },

                        /**
                         * combines all page variables into b obj.
                         * @param  {obj} o : utag.main: {}.
                         * @param  {obj} b : local tag obj
                         * @param  {str} c : key value
                         * @param  {str} d : "utag.main"
                         */
                         'RDcp': function(o, b, c, d) {
                            b = utag.loader.RC();
                            for (d in b) {
                                if (d.match(/utag_(.*)/)) {
                                    for (c in utag.loader.GV(b[d])) {
                                        o['cp.utag_' + RegExp.$1 + '_' + c] = b[d][c];
                                    }
                                }
                            }
                            for (c in utag.loader.GV((utag.cl && !utag.cl['_all_']) ? utag.cl : b)) {
                                if (c.indexOf('utag_') < 0 && typeof b[c] != 'undefined') o['cp.' + c] = b[c];
                            }
                            // o["_t_visitor_id"]=o["cp.utag_main_v_id"]
                            // o["_t_session_id"]=o["cp.utag_main_ses_id"]
                        },
                        'RDqp': function(o, a, b, c) {
                            a = location.search + (location.hash + '').replace('#', '&');
                            if (utag.cfg.lowerqp) {
                                a = a.toLowerCase();
                            }
                            if (a.length > 1) {
                                b = a.substring(1).split('&');
                                for (a = 0; a < b.length; a++) {
                                    c = b[a].split('=');
                                    if (c.length > 1) {
                                        o['qp.' + c[0]] = utag.ut.decode(c[1]);
                                    }
                                }
                            }
                        },
                        'RDmeta': function(o, a, b, h) {
                            a = document.getElementsByTagName('meta');
                            for (b = 0; b < a.length; b++) {
                                try {
                                    h = a[b].name || a[b].getAttribute('property') || '';
                                } catch (e) {
                                    h = '';
                                    utag.DB(e);
                                }
                                if (utag.cfg.lowermeta) {
                                    h = h.toLowerCase();
                                }
                                if (h != '') {
                                    o['meta.' + h] = a[b].content;
                                }
                            }
                        },
                        /**
                         * Read visitor attributes in local storage
                         * @param  {obj} o : page and data attributes.
                         * @return {[type]}   [description]
                         */
                         'RDva': function(o) {
                            var readAttr = function(o, l) {
                                var a = '',
                                b;
                                a = localStorage.getItem(l);
                                if (!a || a == '{}') return;
                                b = utag.ut.flatten({
                                    va: JSON.parse(a)
                                });
                                utag.ut.merge(o, b, 1);
                            };
                            try {
                                readAttr(o, 'tealium_va');
                                readAttr(o, 'tealium_va_' + o['ut.account'] + '_' + o['ut.profile']);
                            } catch (e) {
                                utag.DB(e);
                            }
                        },
                        'RDut': function(o, a) {
                            // Add built-in data types to the data layer for use in mappings, extensions and RDva function.
                            o['ut.domain'] = utag.cfg.domain;
                            o['ut.version'] = utag.cfg.v;
                            // i.e. "view" or "link"
                            o['ut.event'] = a || 'view';
                            o['ut.visitor_id'] = o['cp.utag_main_v_id'];
                            o['ut.session_id'] = o['cp.utag_main_ses_id'];
                            try {
                                o['ut.account'] = utag.cfg.utid.split('/')[0];
                                o['ut.profile'] = utag.cfg.utid.split('/')[1];
                                o['ut.env'] = utag.cfg.path.split('/')[6];
                            } catch (e) {
                                utag.DB(e);
                            }
                        },
                        'RDses': function(o, a, c) {
                            a = (new Date()).getTime();
                            c = (a + parseInt(utag.cfg.session_timeout)) + '';

                            // cp.utag_main_ses_id will not be in the data layer when it has expired or this is first page view of all time
                            if (!o['cp.utag_main_ses_id']) {
                                o['cp.utag_main_ses_id'] = a + '';
                                o['cp.utag_main__ss'] = '1';
                                o['cp.utag_main__sn'] = (1 + parseInt(o['cp.utag_main__sn'] || 0)) + '';
                            } else {
                                o['cp.utag_main__ss'] = '0';
                            }

                            o['cp.utag_main__pn'] = o['cp.utag_main__pn'] || '1';
                            o['cp.utag_main__st'] = c;

                            utag.loader.SC('utag_main', {
                                '_sn': (o['cp.utag_main__sn'] || 1),
                                '_ss': o['cp.utag_main__ss'],
                                '_st': c,
                                'ses_id': (o['cp.utag_main_ses_id'] || a) + ';exp-session',
                                '_pn': o['cp.utag_main__pn'] + ';exp-session'
                            });
                        },
                        'RDpv': function(o) {
                            if (typeof utag.pagevars == 'function') {
                                utag.DB('Read page variables');
                                utag.pagevars(o);
                            }
                        },
                        'RD': function(o, a) {
                            utag.DB('utag.loader.RD');
                            utag.DB(o);

                            utag.loader.RDcp(o);

                            if (!utag.loader.rd_flag) {
                                utag.loader.rd_flag = 1;
                                o['cp.utag_main_v_id'] = o['cp.utag_main_v_id'] || utag.ut.vi((new Date()).getTime());
                                o['cp.utag_main__pn'] = (1 + parseInt(o['cp.utag_main__pn'] || 0)) + '';
                                // the _st value is not-yet-set for first page view so we'll need wait to write in _pn value (which is exp-session)
                                // The SC function expires (removes) cookie values that expired with the session
                                utag.loader.SC('utag_main', {
                                    'v_id': o['cp.utag_main_v_id']
                                });
                                utag.loader.RDses(o);
                            }

                            // first utag.track call for noview should not clear session start (_ss) value
                            if (a && !utag.cfg.noview) utag.loader.RDses(o);
                            utag.loader.RDqp(o);
                            utag.loader.RDmeta(o);
                            utag.loader.RDdom(o);
                            utag.loader.RDut(o, a || 'view');
                            utag.loader.RDpv(o);
                            utag.loader.RDva(o);
                        },
                        'RC': function(a, x, b, c, d, e, f, g, h, i, j, k, l, m, n, o, v, ck, cv, r, s, t) {
                            o = {};
                            b = ('' + document.cookie != '') ? (document.cookie).split('; ') : [];
                            r = /^(.*?)=(.*)$/;
                            s = /^(.*);exp-(.*)$/;
                            t = (new Date()).getTime();
                            for (c = 0; c < b.length; c++) {
                                if (b[c].match(r)) {
                                    ck = RegExp.$1;
                                    cv = RegExp.$2;
                                }
                                e = utag.ut.decode(cv);
                                if (typeof ck != 'undefined') {
                                    if (ck.indexOf('ulog') == 0 || ck.indexOf('utag_') == 0) {
                                        e = cv.split('$');
                                        g = [];
                                        j = {};
                                        for (f = 0; f < e.length; f++) {
                                            try {
                                                g = e[f].split(':');
                                                if (g.length > 2) {
                                                    g[1] = g.slice(1).join(':');
                                                }
                                                v = '';
                                                if (('' + g[1]).indexOf('~') == 0) {
                                                    h = g[1].substring(1).split('|');
                                                    for (i = 0; i < h.length; i++) h[i] = utag.ut.decode(h[i]);
                                                        v = h;
                                                } else v = utag.ut.decode(g[1]);
                                                j[g[0]] = v;
                                            } catch (er) {
                                                utag.DB(er);
                                            }
                                        }
                                        o[ck] = {};
                                        for (f in utag.loader.GV(j)) {
                                            if (j[f] instanceof Array) {
                                                n = [];
                                                for (m = 0; m < j[f].length; m++) {
                                                    if (j[f][m].match(s)) {
                                                        k = (RegExp.$2 == 'session') ? (typeof j._st != 'undefined' ? j._st : t - 1) : parseInt(RegExp.$2);
                                                        if (k > t) n[m] = (x == 0) ? j[f][m] : RegExp.$1;
                                                    }
                                                }
                                                j[f] = n.join('|');
                                            } else {
                                                j[f] = '' + j[f];
                                                if (j[f].match(s)) {
                                                    k = (RegExp.$2 == 'session') ? (typeof j._st != 'undefined' ? j._st : t - 1) : parseInt(RegExp.$2);
                                                    j[f] = (k < t) ? null : (x == 0 ? j[f] : RegExp.$1);
                                                }
                                            }
                                            if (j[f]) o[ck][f] = j[f];
                                        }
                                    } else if (utag.cl[ck] || utag.cl['_all_']) {
                                        o[ck] = e;
                                    }
                                }
                            }
                            return (a) ? (o[a] ? o[a] : {}) : o;
                        },
                        'SC': function(a, b, c, d, e, f, g, h, i, j, k, x, v) {
                            if (!a) return 0;
                            if (a == 'utag_main' && utag.cfg.nocookie) return 0;
                            v = '';
                            var date = new Date();
                            var exp = new Date();
                            exp.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
                            x = exp.toGMTString();
                            if (c && c == 'da') {
                                x = 'Thu, 31 Dec 2009 00:00:00 GMT';
                            } else if (a.indexOf('utag_') != 0 && a.indexOf('ulog') != 0) {
                                if (typeof b != 'object') {
                                    v = b;
                                }
                            } else {
                                d = utag.loader.RC(a, 0);
                                for (e in utag.loader.GV(b)) {
                                    f = '' + b[e];
                                    if (f.match(/^(.*);exp-(\d+)(\w)$/)) {
                                        g = date.getTime() + parseInt(RegExp.$2) * ((RegExp.$3 == 'h') ? 3600000 : 86400000);
                                        if (RegExp.$3 == 'u') g = parseInt(RegExp.$2);
                                        f = RegExp.$1 + ';exp-' + g;
                                    }
                                    if (c == 'i') {
                                        if (d[e] == null) d[e] = f;
                                    } else if (c == 'd') delete d[e];
                                    else if (c == 'a') d[e] = (d[e] != null) ? (f - 0) + (d[e] - 0) : f;
                                    else if (c == 'ap' || c == 'au') {
                                        if (d[e] == null) d[e] = f;
                                        else {
                                            if (d[e].indexOf('|') > 0) {
                                                d[e] = d[e].split('|');
                                            }
                                            g = (d[e] instanceof Array) ? d[e] : [d[e]];
                                            g.push(f);
                                            if (c == 'au') {
                                                h = {};
                                                k = {};
                                                for (i = 0; i < g.length; i++) {
                                                    if (g[i].match(/^(.*);exp-(.*)$/)) {
                                                        j = RegExp.$1;
                                                    }
                                                    if (typeof k[j] == 'undefined') {
                                                        k[j] = 1;
                                                        h[g[i]] = 1;
                                                    }
                                                }
                                                g = [];
                                                for (i in utag.loader.GV(h)) {
                                                    g.push(i);
                                                }
                                            }
                                            d[e] = g;
                                        }
                                    } else d[e] = f;
                                }
                                h = [];
                                for (g in utag.loader.GV(d)) {
                                    if (d[g] instanceof Array) {
                                        for (c = 0; c < d[g].length; c++) {
                                            d[g][c] = encodeURIComponent(d[g][c]);
                                        }
                                        h.push(g + ':~' + d[g].join('|'));
                                    } else h.push((g + ':').replace(/[\,\$\;\?]/g, '') + encodeURIComponent(d[g]));
                                }
                                if (h.length == 0) {
                                    h.push('');
                                    x = '';
                                }
                                v = (h.join('$'));
                            }
                            document.cookie = a + '=' + v + ';path=/;domain=' + utag.cfg.domain + ';expires=' + x;
                            return 1;
                        },
                        'LOAD': function(a, b, c, d) {
                            // utag.DB('utag.loader.LOAD:' + a)
                            if (!utag.loader.cfg) {
                                return;
                            }
                            if (this.ol == 0) {
                                if (utag.loader.cfg[a].block && utag.loader.cfg[a].cbf) {
                                    this.f[a] = 1
                                    delete utag.loader.bq[a];
                                }
                                for (b in utag.loader.GV(utag.loader.bq)) {
                                    if (utag.loader.cfg[a].load == 4 && utag.loader.cfg[a].wait == 0) {
                                        utag.loader.bk[a] = 1;
                                        utag.DB('blocked: ' + a);
                                    }
                                    utag.DB('blocking: ' + b);
                                    return;
                                }
                                utag.loader.INIT();
                                return;
                            }
                            utag.DB('utag.loader.LOAD:' + a);

                            if (this.f[a] == 0) {
                                this.f[a] = 1;

                                if (utag.cfg.noview != true) {
                                    if (utag.loader.cfg[a].send) {
                                        utag.DB('SENDING: ' + a);
                                        try {
                                            if (utag.loader.sendq.pending > 0 && utag.loader.sendq[a]) {
                                                utag.DB('utag.loader.LOAD:sendq: ' + a);
                                                while ((d = utag.loader.sendq[a].shift())) {
                                                    utag.DB(d);
                                                    utag.sender[a].send(d.event, utag.handler.C(d.data));
                                                    utag.loader.sendq.pending--;
                                                }
                                            } else {
                                                utag.sender[a].send('view', utag.handler.C(utag.data));
                                            }
                                            utag.rpt['s_' + a] = 0;
                                        } catch (e) {
                                            utag.DB(e);
                                            utag.rpt['s_' + a] = 1;
                                        }
                                    }
                                }
                                if (utag.loader.rf == 0) return;
                                for (b in utag.loader.GV(this.f)) {
                                    if (this.f[b] == 0 || this.f[b] == 2) return;
                                }
                                utag.loader.END();
                            }
                        },
                        'EV': function(a, b, c, d) {
                            if (b == 'ready') {
                                if (!utag.data) {
                                    try {
                                        utag.cl = {
                                            '_all_': 1
                                        };
                                        utag.loader.initdata();
                                        utag.loader.RD(utag.data);
                                    } catch (e) {
                                        utag.DB(e);
                                    }
                                }
                                if ((document.attachEvent || utag.cfg.dom_complete) ? document.readyState === 'complete' : document.readyState !== 'loading') setTimeout(c, 1);
                                else {
                                    utag.loader.ready_q.push(c);
                                    var RH;

                                    if (utag.loader.ready_q.length <= 1) {
                                        if (document.addEventListener) {
                                            RH = function() {
                                                document.removeEventListener('DOMContentLoaded', RH, false);
                                                utag.loader.run_ready_q();
                                            };
                                            if (!utag.cfg.dom_complete) document.addEventListener('DOMContentLoaded', RH, false);
                                            window.addEventListener('load', utag.loader.run_ready_q, false);
                                        } else if (document.attachEvent) {
                                            RH = function() {
                                                if (document.readyState === 'complete') {
                                                    document.detachEvent('onreadystatechange', RH);
                                                    utag.loader.run_ready_q();
                                                }
                                            };
                                            document.attachEvent('onreadystatechange', RH);
                                            window.attachEvent('onload', utag.loader.run_ready_q);
                                        }
                                    }
                                }
                            } else {
                                if (a.addEventListener) {
                                    a.addEventListener(b, c, false);
                                } else if (a.attachEvent) {
                                    a.attachEvent(((d == 1) ? '' : 'on') + b, c);
                                }
                            }
                        },
                        'END': function(b, c, d, e, v, w) {
                            if (this.ended) {
                                return;
                            }
                            this.ended = 1;
                            utag.DB('loader.END');
                            b = utag.data;
                            // add the default values for future utag.link/view calls
                            if (utag.handler.base && utag.handler.base != '*') {
                                e = utag.handler.base.split(',');
                                for (d = 0; d < e.length; d++) {
                                    if (typeof b[e[d]] != 'undefined') utag.handler.df[e[d]] = b[e[d]];
                                }
                            } else if (utag.handler.base == '*') {
                                utag.ut.merge(utag.handler.df, b, 1);
                            }

                            utag.rpt['r_0'] = 't';
                            for (var r in utag.loader.GV(utag.cond)) {
                                utag.rpt['r_' + r] = (utag.cond[r]) ? 't' : 'f';
                            }

                            utag.rpt.ts['s'] = new Date();

                            v = '.tiqcdn.com';
                            w = utag.cfg.path.indexOf(v);
                            if (w > 0 && b['cp.utag_main__ss'] == 1 && !utag.cfg.no_session_count) utag.ut.loader({
                                src: utag.cfg.path.substring(0, w) + v + '/ut' + 'ag/tiqapp/ut' + 'ag.v.js?a=' + utag.cfg.utid + (utag.cfg.nocookie ? '&nocookie=1' : '&cb=' + (new Date).getTime()),
                                id: 'tiqapp'
                            });

                                if (utag.cfg.noview != true) utag.handler.RE('view', b, 'end');
                                utag.handler.INIT();
                            },
                            'initdata': function() {
                                try {
                                    utag.data = (typeof utag_data != 'undefined') ? utag_data : {};
                                    utag.udoname = 'utag_data';
                                } catch (e) {
                                    utag.data = {};
                                    utag.DB('idf:' + e);
                                }
                            },
                            'loadrules': function(_pd, _pc) {
                                var d = _pd || utag.data;
                                var c = _pc || utag.cond;
                                for (var l in utag.loader.GV(c)) {
                                    switch (l) {}
                                }
                            },
                            'GET': function() {
                                utag.cl = {
                                    '_all_': 1
                                };
                                utag.pre();
                            ////////////////////////////////
                            // all tag scoped extensions  //
                            ////////////////////////////////
                            utag.handler.extend = [];
                            utag.handler.cfg_extend = [];

                            /**
                             * [initcfg description]
                             *
                             * @return {[type]} [description]
                             */
                             utag.loader.initcfg = function() {
                                utag.loader.cfg = {};
                                utag.loader.cfgsort = [];
                            };
                            utag.loader.initcfg();
                        },
                        'PINIT': function(a, b, c) {
                            utag.DB('Pre-INIT');
                            if (utag.cfg.noload) {
                                return;
                            }

                            try {
                                // Initialize utag.data
                                this.GET();
                                // Even if noview flag is set, we still want to load in tags and have them ready to fire
                                // FUTURE: blr = "before load rules"
                                if (utag.handler.RE('view', utag.data, 'blr')) {
                                    utag.handler.LR(utag.data);
                                }
                            } catch (e) {
                                utag.DB(e);
                            }
                            // process 'blocking' tags (tags that need to run first)
                            a = this.cfg;
                            c = 0;
                            for (b in this.GV(a)) {
                                // external .js files (currency converter tag) are blocking
                                if (a[b].block == 1 || (a[b].load > 0 && (typeof a[b].src != 'undefined' && a[b].src != ''))) {
                                    a[b].block = 1;
                                    c = 1;
                                    this.bq[b] = 1;
                                }
                            }
                            if (c == 1) {
                                for (b in this.GV(a)) {
                                    if (a[b].block) {
                                        // handle case of bundled and blocking (change 4 to 1)
                                        // (bundled tags that do not have a .src should really never be set to block... they just run first)
                                        a[b].id = b;
                                        if (a[b].load == 4) a[b].load = 1;
                                        a[b].cb = function() {
                                            var d = this.uid;
                                            utag.loader.cfg[d].cbf = 1;
                                            utag.loader.LOAD(d);
                                        };
                                        this.AS(a[b]);
                                    }
                                }
                            }
                            if (c == 0) this.INIT();
                        },
                        /**
                         * this is the last function to be called now that all other functions are declared and is the initialization method for running Tealium on a webpage. It triggers utag.loader.GET which is responsible for running utag.pre and utag.handler.extend (described above). It then determines which tags are added to the wait queue and which get loaded immediately.
                         *
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {[type]} c [description]
                         * @param  {[type]} d [description]
                         * @param  {[type]} e [description]
                         *
                         * @return {[type]}   [description]
                         */
                         'INIT': function(a, b, c, d, e) {
                            utag.DB('utag.loader.INIT');
                            if (this.ol == 1) return -1;
                            else this.ol = 1;
                            // The All Tags scope extensions run after blocking tags complete
                            // The noview flag means to skip these Extensions (will run later for manual utag.view call)
                            if (utag.cfg.noview != true) utag.handler.RE('view', utag.data, 'alr');

                            utag.rpt.ts['i'] = new Date();

                            d = this.cfgsort;
                            // TODO: Publish engine should sort the bundled tags first..
                            for (a = 0; a < d.length; a++) {
                                e = d[a];
                                b = this.cfg[e];
                                b.id = e;
                                // s2s (ServerStream) tags do not load client-side
                                if (b.block != 1 && b.s2s != 1) {
                                    // do not wait if the utag.cfg.noview flag is set and the tag is bundled
                                    if (utag.loader.bk[b.id] || ((utag.cfg.readywait || utag.cfg.noview) && b.load == 4)) {
                                        this.f[b.id] = 0;
                                        utag.loader.LOAD(b.id);
                                    } else if (b.wait == 1 && utag.loader.rf == 0) {
                                        utag.DB('utag.loader.INIT: waiting ' + b.id);
                                        this.wq.push(b);
                                        this.f[b.id] = 2;
                                    } else if (b.load > 0) {
                                        utag.DB('utag.loader.INIT: loading ' + b.id);
                                        this.lq.push(b);
                                        this.AS(b);
                                    }
                                }
                            }

                            if (this.wq.length > 0) utag.loader.EV('', 'ready', function(a) {
                                if (utag.loader.rf == 0) {
                                    utag.DB('READY:utag.loader.wq');
                                    utag.loader.rf = 1;
                                    utag.loader.WQ();
                                }
                            });
                                else if (this.lq.length > 0) utag.loader.rf = 1;
                                else if (this.lq.length == 0) utag.loader.END();

                                return 1;
                            },
                            'rd_flag': 1,
                            'initcfg': function() {
                                utag.loader.cfg = {};
                                utag.loader.cfgsort = [];
                            },
                            'cfg': {},
                            'cfgsort': [],
                            'ended': 1
                        },
                        'DB': function(a, b) {
                        // return right away if we've already checked the cookie
                        if (utag.cfg.utagdb === false) {
                            return;
                        } else if (typeof utag.cfg.utagdb == 'undefined') {
                            b = document.cookie + '';
                            utag.cfg.utagdb = ((b.indexOf('utagdb=true') >= 0) ? true : false);
                        }
                        if (utag.cfg.utagdb === true) {
                            var t;
                            if (utag.ut.typeOf(a) == 'object') {
                                t = utag.handler.C(a);
                            } else {
                                t = a;
                            }
                            utag.db_log.push(t);
                            try {
                                if (!utag.cfg.noconsole) console.log(t);
                            } catch (e) {}
                        }
                    },
                    'RP': function(a, b, c) {
                        if (typeof a != 'undefined' && typeof a.src != 'undefined' && a.src != '') {
                            b = [];
                            for (c in utag.loader.GV(a)) {
                                if (c != 'src') b.push(c + '=' + escape(a[c]));
                            }
                            this.dbi.push((new Image()).src = a.src + '?utv=' + utag.cfg.v + '&utid=' + utag.cfg.utid + '&' + (b.join('&')));
                        }
                    },
                    'view': function(a, c, d) {
                        return this.track({
                            event: 'view',
                            data: a,
                            cfg: {
                                cb: c,
                                uids: d
                            }
                        });
                    },
                    'link': function(a, c, d) {
                        return this.track({
                            event: 'link',
                            data: a,
                            cfg: {
                                cb: c,
                                uids: d
                            }
                        });
                    },
                    'track': function(a, b, c, d) {
                        if (typeof a == 'string') a = {
                            event: a,
                            data: b,
                            cfg: {
                                cb: c
                            }
                        };

                        for (d in utag.loader.GV(utag.o)) {
                            try {
                                utag.o[d].handler.trigger(a.event || 'view', a.data || a, a.cfg);
                            } catch (e) {
                                utag.DB(e);
                            }
                        }
                        if (a.cfg && a.cfg.cb) try {
                            a.cfg.cb();
                        } catch (e) {
                            utag.DB(e);
                        }
                        return true;
                    },
                    'handler': {
                        'base': '',
                        'df': {},
                        'o': {},
                        'send': {},
                        'iflag': 1,
                        'INIT': function(a, b, c) {
                            utag.DB('utag.handler.INIT');
                            if (utag.initcatch) {
                                utag.initcatch = 0;
                                return;
                            }
                            this.iflag = 1;
                            a = utag.loader.q.length;
                            if (a > 0) {
                                utag.DB('Loader queue');
                                for (b = 0; b < a; b++) {
                                    c = utag.loader.q[b];
                                    utag.handler.trigger(c.a, c.b, c.c);
                                }
                            }
                            // ##UTABSOLUTELAST##
                        },
                        /**
                         * [description]
                         *
                         * @return {[type]} [description]
                         */
                         'test': function() {
                            return 1;
                        },
                        /**
                         * [description]
                         *
                         * @param  {object} b :utag.data + utag_data;
                         *
                         */
                         'LR': function(b) {
                            utag.DB('Load Rules');
                            for (var d in utag.loader.GV(utag.cond)) {
                                utag.cond[d] = false;
                            }
                            utag.DB(b);
                            utag.loader.loadrules(b);
                            utag.DB(utag.cond);
                            utag.loader.initcfg();
                            // use the OPTOUTMULTI cookie value to override load rules
                            utag.loader.OU();
                            for (var r in utag.loader.GV(utag.cond)) {
                                utag.rpt['r_' + r] = (utag.cond[r]) ? 't' : 'f';
                            }
                        },
                        /**
                         * run extensions before load rules 'blr'
                         * or
                         * run extensions after load rules 'alr'
                         *
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {str} c :before or after loadrules label.
                         * @param  {[type]} d [description]
                         * @param  {[type]} e [description]
                         * @param  {[type]} f [description]
                         * @param  {[type]} g [description]
                         *
                         * @return {[type]}   [description]
                         */
                         'RE': function(a, b, c, d, e, f, g) {
                            if (c != 'alr' && !this.cfg_extend) {
                                return 0;
                            }
                            utag.DB('RE: ' + c);
                            if (c == 'alr') utag.DB('All Tags EXTENSIONS');
                            utag.DB(b);
                            if (typeof this.extend != 'undefined') {
                                g = 0;
                                for (d = 0; d < this.extend.length; d++) {
                                    try {
                                        /* Extension Attributes */
                                        e = 0;
                                        if (typeof this.cfg_extend != 'undefined') {
                                            f = this.cfg_extend[d];
                                            if (typeof f.count == 'undefined') f.count = 0;
                                            if (f[a] == 0 || (f.once == 1 && f.count > 0) || f[c] == 0) {
                                                e = 1;
                                            } else {
                                                if (f[c] == 1) {
                                                    g = 1;
                                                }
                                                f.count++;
                                            }
                                        }
                                        if (e != 1) {
                                            this.extend[d](a, b);
                                            utag.rpt['ex_' + d] = 0;
                                        }
                                    } catch (er) {
                                        utag.DB(er);
                                        utag.rpt['ex_' + d] = 1;
                                        utag.ut.error({
                                            e: er.message,
                                            s: utag.cfg.path + 'utag.js',
                                            l: d,
                                            t: 'ge'
                                        });
                                    }
                                }
                                utag.DB(b);
                                return g;
                            }
                        },
                        /**
                         *  responsible for executing All Tags extensions as well as calling the individual tag templates via utag.sender[c].send(a, utag.handler.C(b));
                         *
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {[type]} c [description]
                         * @param  {[type]} d [description]
                         * @param  {[type]} e [description]
                         * @param  {[type]} f [description]
                         *
                         * @return {[type]}   [description]
                         */
                         'trigger': function(a, b, c, d, e, f) {
                            utag.DB('trigger:' + a + (c && c.uids ? ':' + c.uids.join(',') : ''));
                            b = b || {};
                            utag.DB(b);

                            if (!this.iflag) {
                                utag.DB('trigger:called before tags loaded');
                                for (d in utag.loader.f) {
                                    if (!(utag.loader.f[d] === 1)) utag.DB('Tag ' + d + ' did not LOAD');
                                }
                                utag.loader.q.push({
                                    a: a,
                                    b: utag.handler.C(b),
                                    c: c
                                });
                                return;
                            }

                            // update all values for AJAX pages
                            utag.ut.merge(b, this.df, 0);
                            utag.loader.RD(b, a);

                            // clearing noview flag after the RD function call
                            utag.cfg.noview = false;

                            /**
                             * [sendTag description]
                             *
                             * @param  {[type]} a [description]
                             * @param  {[type]} b [description]
                             * @param  {[type]} d [description]
                             *
                             * @return {[type]}   [description]
                             */
                             function sendTag(a, b, d) {
                                try {
                                    if (typeof utag.sender[d] != 'undefined') {
                                        utag.DB('SENDING: ' + d);
                                        utag.sender[d].send(a, utag.handler.C(b));
                                        utag.rpt['s_' + d] = 0;
                                    } else if (utag.loader.cfg[d].load != 2 && utag.loader.cfg[d].s2s != 1) {
                                        // utag.link calls can load in new tags
                                        utag.loader.sendq[d] = utag.loader.sendq[d] || [];
                                        utag.loader.sendq[d].push({
                                            'event': a,
                                            'data': utag.handler.C(b)
                                        });
                                        utag.loader.sendq.pending++;
                                        utag.loader.AS({
                                            id: d,
                                            load: 1
                                        });
                                    }
                                } catch (e) {
                                    utag.DB(e);
                                }
                            }

                            // utag.track( { event : "view", data: {myvar : "myval" }, cfg: { uids : [1,2,10] } } )
                            if (c && c.uids) {
                                this.RE(a, b, 'alr');
                                for (f = 0; f < c.uids.length; f++) {
                                    d = c.uids[f];
                                    // bypass load rules
                                    sendTag(a, b, d);
                                }
                            } else if (utag.cfg.load_rules_ajax) {
                                this.RE(a, b, 'blr');
                                // process load rules based on current data layer
                                this.LR(b);
                                this.RE(a, b, 'alr');

                                for (f = 0; f < utag.loader.cfgsort.length; f++) {
                                    d = utag.loader.cfgsort[f];
                                    if (utag.loader.cfg[d].load && utag.loader.cfg[d].send) {
                                        sendTag(a, b, d);
                                    }
                                }
                            } else {
                                // legacy behavior
                                this.RE(a, b, 'alr');
                                for (d in utag.loader.GV(utag.sender)) {
                                    sendTag(a, b, d);
                                }
                            }
                            this.RE(a, b, 'end');
                        },

                        /**
                         * copies the parameter passed into it and outputs to the "b" object. Note: while this works correctly for strings, it is still only a reference for arrays so if you edit the array in one place it edits the array in all places.
                         *
                         * @param  {[type]} a [description]
                         * @param  {[type]} b [description]
                         * @param  {[type]} c [description]
                         *
                         * @return {[type]}   [description]
                         */
                         C: function(a, b, c) {
                            b = {};
                            // copy values in a obj into local b obj.
                            for (c in utag.loader.GV(a)) {
                                if (a[c] instanceof Array) {
                                    b[c] = a[c].slice(0);
                                } else {
                                    // objects are still references to the original (not copies)
                                    b[c] = a[c];
                                }
                            }
                            return b;
                        },
                        'extend': [],
                        'cfg_extend': []
                    },
                    'ut': {
                        'pad': function(a, b, c, d) {
                            a = '' + ((a - 0).toString(16));
                            d = '';
                            if (b > a.length) {
                                for (c = 0; c < (b - a.length); c++) {
                                    d += '0';
                                }
                            }
                            return '' + d + a;
                        },
                        'vi': function(t, a, b) {
                            if (!utag.v_id) {
                                a = this.pad(t, 12);
                                b = '' + Math.random();
                                a += this.pad(b.substring(2, b.length), 16);
                                try {
                                    a += this.pad((navigator.plugins.length ? navigator.plugins.length : 0), 2);
                                    a += this.pad(navigator.userAgent.length, 3);
                                    a += this.pad(document.URL.length, 4);
                                    a += this.pad(navigator.appVersion.length, 3);
                                    a += this.pad(screen.width + screen.height + parseInt((screen.colorDepth) ? screen.colorDepth : screen.pixelDepth), 5);
                                } catch (e) {
                                    utag.DB(e);
                                    a += '12345';
                                }
                                utag.v_id = a;
                            }
                            return utag.v_id;
                        },
                        'hasOwn': function(o, a) {
                            return o != null && Object.prototype.hasOwnProperty.call(o, a);
                        },
                        'isEmptyObject': function(o, a) {
                            for (a in o) {
                                if (utag.ut.hasOwn(o, a)) return false;
                            }
                            return true;
                        },
                        'isEmpty': function(o) {
                            var t = utag.ut.typeOf(o);
                            if (t == 'number') {
                                return isNaN(o);
                            } else if (t == 'boolean') {
                                return false;
                            } else if (t == 'string') {
                                return o.length === 0;
                            } else return utag.ut.isEmptyObject(o);
                        },
                        'typeOf': function(e) {
                            return ({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
                        },

                        /**
                         * [description]
                         *
                         * @param  {[type]} o [description]
                         *
                         * @return {[type]}   [description]
                         */
                         'flatten': function(o) {
                            // stop when arriving at a string, array, boolean, number (float or integer)
                            var a = {};

                            function r(c, p) {
                                if (Object(c) !== c || c instanceof Array) {
                                    a[p] = c;
                                } else {
                                    if (utag.ut.isEmptyObject(c)) {
                                        a[p] = {};
                                    } else {
                                        for (var d in c) {
                                            r(c[d], p ? p + '.' + d : d);
                                        }
                                    }
                                }
                            }
                            r(o, '');

                            return a;
                        },
                        'merge': function(a, b, c, d) {
                            if (c) {
                                for (d in utag.loader.GV(b)) {
                                    a[d] = b[d];
                                }
                            } else {
                                for (d in utag.loader.GV(b)) {
                                    if (typeof a[d] == 'undefined') a[d] = b[d];
                                }
                            }
                        },
                        'decode': function(a, b) {
                            b = '';
                            try {
                                b = decodeURIComponent(a);
                            } catch (e) {
                                utag.DB(e);
                            }
                            if (b == '') {
                                b = unescape(a);
                            }
                            return b;
                        },
                        'encode': function(a, b) {
                            b = '';
                            try {
                                b = encodeURIComponent(a);
                            } catch (e) {
                                utag.DB(e);
                            }
                            if (b == '') {
                                b = escape(a);
                            }
                            return b;
                        },
                        'error': function(a, b, c) {
                            if (typeof utag_err != 'undefined') {
                                utag_err.push(a);
                            }
                        },
                        'loader': function(o, a, b, c, l, m) {
                            utag.DB(o);
                            a = document;
                            if (o.type == 'iframe') {
                                // if iframe of same ID already exists, just reset the src value (do not create a new iframe)
                                m = a.getElementById(o.id);
                                if (m && m.tagName == 'IFRAME') {
                                    b = m;
                                } else {
                                    b = a.createElement('iframe');
                                }
                                o.attrs = o.attrs || {};
                                utag.ut.merge(o.attrs, {
                                    'height': '1',
                                    'width': '1',
                                    'style': 'display:none'
                                }, 0);
                            } else if (o.type == 'img') {
                                utag.DB('Attach img: ' + o.src);
                                b = new Image();
                            } else {
                                b = a.createElement('script');
                                b.language = 'javascript';
                                b.type = 'text/javascript';
                                b.async = 1;
                                b.charset = 'utf-8';
                            }
                            if (o.id) {
                                b.id = o.id;
                            }
                            for (l in utag.loader.GV(o.attrs)) {
                                b.setAttribute(l, o.attrs[l]);
                            }
                            b.setAttribute('src', o.src);
                            if (typeof o.cb == 'function') {
                                if (b.addEventListener) {
                                    b.addEventListener('load', function() {
                                        o.cb();
                                    }, false);
                                } else {
                                    // old IE support
                                    b.onreadystatechange = function() {
                                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                                            this.onreadystatechange = null;
                                            o.cb();
                                        }
                                    };
                                }
                            }

                            if (o.type != 'img' && !m) {
                                l = o.loc || 'head';
                                c = a.getElementsByTagName(l)[0];
                                if (c) {
                                    utag.DB('Attach to ' + l + ': ' + o.src);
                                    if (l == 'script') {
                                        c.parentNode.insertBefore(b, c);
                                    } else {
                                        c.appendChild(b);
                                    }
                                }
                            }
                        }
                    },
                    //  represents the "Advanced Settings" of the Tag Configurations.
                    'cfg': {
                        'template': 'ut4.41.',
                        'load_rules_ajax': true,
                        'load_rules_at_wait': false,
                        'lowerqp': false,
                        'noconsole': false,
                        'session_timeout': 1800000,
                        'readywait': 1,
                        'noload': 0,
                        'domain': '0.1',
                        'path': '//tags.tiqcdn.com/utag/services-mauricio/main/prod/',
                        'utid': 'services-mauricio/main/201609062336',
                        'v': 'ut4.41.201609062336',
                        'utagdb': false
                    },
                    'cond': {},
                    'pagevars': function(ud) {
                        ud = ud || utag.data;
                        try {
                            ud['js_page.modus'] = modus;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.Prism.filename'] = Prism.filename;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.availWidth'] = screen.availWidth;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.availHeight'] = screen.availHeight;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.width'] = screen.width;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.height'] = screen.height;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.colorDepth'] = screen.colorDepth;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.pixelDepth'] = screen.pixelDepth;
                        } catch (e) {
                            utag.DB(e);
                        }
                        try {
                            ud['js_page.screen.availLeft'] = screen.availLeft;
                        } catch (e) {
                            utag.DB(e);
                        }
                    },
                    /**
                     * gathers all page data into utag.data and then runs the load rules
                     * @return {[type]} [description]
                     */
                     'pre': function() {
                        utag.loader.initdata();
                        utag.pagevars();
                        try {
                            utag.loader.RD(utag.data);
                        } catch (e) {
                            utag.DB(e);
                        }
                        utag.loader.loadrules();
                    },
                    'cl': {
                        '_all_': 1
                    },
                    'data': {
                        'js_page.screen.availWidth': 1440,
                        'js_page.screen.availHeight': 873,
                        'js_page.screen.width': 1440,
                        'js_page.screen.height': 900,
                        'js_page.screen.colorDepth': 24,
                        'js_page.screen.pixelDepth': 24,
                        'js_page.screen.availLeft': 0,
                        'dom.referrer': '',
                        'dom.title': 'utag-floodlight-test',
                        'dom.domain': '127.0.0.1',
                        'dom.query_string': '',
                        'dom.hash': '',
                        'dom.url': 'http://127.0.0.1:8080/',
                        'dom.pathname': '/',
                        'dom.viewport_height': 150,
                        'dom.viewport_width': 1404,
                        'ut.domain': '0.1',
                        'ut.version': 'ut4.41.201609062336',
                        'ut.event': 'view',
                        'ut.visitor_id': undefined,
                        'ut.session_id': undefined,
                        'ut.account': 'services-mauricio',
                        'ut.profile': 'main',
                        'ut.env': 'prod'
                    },
                    'udoname': 'utag_data',
                    'v_id': '015703afd61c001f121cf2bb246405077001606f0093c'
                };
                utag.DB('utag.handler.INIT');
                if (utag.initcatch) {
                    utag.initcatch = 0;
                    return;
                }
                this.iflag = 1;
                a = utag.loader.q.length;
                if (a > 0) {
                    utag.DB('Loader queue');
                    for (b = 0; b < a; b++) {
                        c = utag.loader.q[b];
                        utag.handler.trigger(c.a, c.b, c.c);
                    }
                }
                // ##UTABSOLUTELAST##
            },

            /**
             * [test description]
             * @return {[type]} [description]
             */
             test: function() {
                return 1;
            },

            /**
             * reset and run load rules
             * @param {[type]} b [description]
             */
             LR: function(b) {
                utag.DB('Load Rules');
                for (var d in utag.loader.GV(utag.cond)) {
                    utag.cond[d] = false;
                }
                utag.DB(b);
                utag.loader.loadrules(b);
                utag.DB(utag.cond);
                utag.loader.initcfg();
                // use the OPTOUTMULTI cookie value to override load rules
                utag.loader.OU();
                for (var r in utag.loader.GV(utag.cond)) {
                    utag.rpt['r_' + r] = (utag.cond[r]) ? 't' : 'f';
                }
            },

            /**
             * set 'after load rules' or 'before load rules' attributes
             * The third param "c" is a string that defines the location i.e. "blr" == before load rules
             * @param {str} a :type of event "view" or "link"
             * @param {obj} b :b obj with params set
             * @param {str} c :string value "blr"
             * @param {int} d :loop value. initial expression.
             * @param {[type]} e [description]
             * @param {[type]} f [description]
             * @param {[type]} g [description]
             */
             RE: function(a, b, c, d, e, f, g) {
                if (c != 'alr' && !this.cfg_extend) {
                    return 0;
                }
                utag.DB('RE: ' + c);
                if (c == 'alr')
                    utag.DB('All Tags EXTENSIONS');
                utag.DB(b);
                if (typeof this.extend != 'undefined') {
                    g = 0;
                    for (d = 0; d < this.extend.length; d++) {
                        try {
                            /* Extension Attributes */
                            e = 0;
                            if (typeof this.cfg_extend != 'undefined') {
                                f = this.cfg_extend[d];
                                if (typeof f.count == 'undefined')
                                    f.count = 0;
                                if (f[a] == 0 || (f.once == 1 && f.count > 0) || f[c] == 0) {
                                    e = 1;
                                } else {
                                    if (f[c] == 1) {
                                        g = 1;
                                    }
                                    f.count++;
                                }
                            }
                            if (e != 1) {
                                this.extend[d](a, b);
                                utag.rpt['ex_' + d] = 0;
                            }
                        } catch (er) {
                            utag.DB(er);
                            utag.rpt['ex_' + d] = 1;
                            utag.ut.error({
                                e: er.message,
                                s: utag.cfg.path + 'utag.js',
                                l: d,
                                t: 'ge'
                            });
                        }
                    }
                    utag.DB(b);
                    return g;
                }
            },

            /**
             * [trigger description]
             * @param  {[type]} a [description]
             * @param  {[type]} b [description]
             * @param  {[type]} c [description]
             * @param  {[type]} d [description]
             * @param  {[type]} e [description]
             * @param  {[type]} f [description]
             * @return {[type]}   [description]
             */
             trigger: function(a, b, c, d, e, f) {
                utag.DB('trigger:' + a + (c && c.uids ? ':' + c.uids.join(',') : ''));
                b = b || {};
                utag.DB(b);
                if (!this.iflag) {
                    utag.DB('trigger:called before tags loaded');
                    for (d in utag.loader.f) {
                        if (!(utag.loader.f[d] === 1))
                            utag.DB('Tag ' + d + ' did not LOAD');
                    }
                    utag.loader.q.push({
                        a: a,
                        b: utag.handler.C(b),
                        c: c
                    });
                    return;
                }
                // update all values for AJAX pages
                utag.ut.merge(b, this.df, 0);
                utag.loader.RD(b, a);
                // clearing noview flag after the RD function call
                utag.cfg.noview = false;

                /**
                 * [sendTag description]
                 * @param  {[type]} a [description]
                 * @param  {[type]} b [description]
                 * @param  {[type]} d [description]
                 * @return {[type]}   [description]
                 */
                 function sendTag(a, b, d) {
                    try {
                        if (typeof utag.sender[d] != 'undefined') {
                            utag.DB('SENDING: ' + d);
                            utag.sender[d].send(a, utag.handler.C(b));
                            utag.rpt['s_' + d] = 0;
                        } else if (utag.loader.cfg[d].load != 2 && utag.loader.cfg[d].s2s != 1) {
                            // utag.link calls can load in new tags
                            utag.loader.sendq[d] = utag.loader.sendq[d] || [];
                            utag.loader.sendq[d].push({
                                'event': a,
                                'data': utag.handler.C(b)
                            });
                            utag.loader.sendq.pending++;
                            utag.loader.AS({
                                id: d,
                                load: 1
                            });
                        }
                    } catch (e) {
                        utag.DB(e);
                    }
                }

                // utag.track( { event : "view", data: {myvar : "myval" }, cfg: { uids : [1,2,10] } } )
                if (c && c.uids) {
                    this.RE(a, b, 'alr');
                    for (f = 0; f < c.uids.length; f++) {
                        d = c.uids[f];
                        // bypass load rules
                        sendTag(a, b, d);
                    }
                } else if (utag.cfg.load_rules_ajax) {
                    this.RE(a, b, 'blr');
                    // process load rules based on current data layer
                    this.LR(b);
                    this.RE(a, b, 'alr');
                    for (f = 0; f < utag.loader.cfgsort.length; f++) {
                        d = utag.loader.cfgsort[f];
                        if (utag.loader.cfg[d].load && utag.loader.cfg[d].send) {
                            sendTag(a, b, d);
                        }
                    }
                } else {
                    // legacy behavior
                    this.RE(a, b, 'alr');
                    for (d in utag.loader.GV(utag.sender)) {
                        sendTag(a, b, d);
                    }
                }
                this.RE(a, b, 'end');
            },

            /**
             * "sort-of" copy
             * @param {[type]} a [description]
             * @param {[type]} b [description]
             * @param {[type]} c [description]
             */
             C: function(a, b, c) {
                b = {};
                for (c in utag.loader.GV(a)) {
                    if (a[c] instanceof Array) {
                        b[c] = a[c].slice(0);
                    } else {
                        // objects are still references to the original (not copies)
                        b[c] = a[c];
                    }
                }
                return b;
            }
        },
        ut: {
            /**
             * pad string by num of chars.
             * @param  {[type]} a [description]
             * @param  {[type]} b [description]
             * @param  {[type]} c [description]
             * @param  {[type]} d [description]
             * @return {[type]}   [description]
             */
             pad: function(a, b, c, d) {
                a = '' + ((a - 0).toString(16));
                d = '';
                if (b > a.length) {
                    for (c = 0; c < (b - a.length); c++) {
                        d += '0';
                    }
                }
                return '' + d + a;
            },

            /**
             * [vi description]
             * @param  {[type]} t [description]
             * @param  {[type]} a [description]
             * @param  {[type]} b [description]
             * @return {[type]}   [description]
             */
             vi: function(t, a, b) {
                if (!utag.v_id) {
                    a = this.pad(t, 12);
                    b = '' + Math.random();
                    a += this.pad(b.substring(2, b.length), 16);
                    try {
                        a += this.pad((navigator.plugins.length ? navigator.plugins.length : 0), 2);
                        a += this.pad(navigator.userAgent.length, 3);
                        a += this.pad(document.URL.length, 4);
                        a += this.pad(navigator.appVersion.length, 3);
                        a += this.pad(screen.width + screen.height + parseInt((screen.colorDepth) ? screen.colorDepth : screen.pixelDepth), 5);
                    } catch (e) {
                        utag.DB(e);
                        a += '12345';
                    }
                    utag.v_id = a;
                }
                return utag.v_id;
            },

            /**
             * Object.prototype.hasOwn check
             * @param  {[type]}  o [description]
             * @param  {[type]}  a [description]
             * @return {Boolean}   [description]
             */
             hasOwn: function(o, a) {
                // fun.call(thisArg[, arg1[, arg2[, ...]]])
                return o != null && Object.prototype.hasOwnProperty.call(o, a);
            },

            /**
             * [isEmptyObject description]
             * @param  {[type]}  o [description]
             * @param  {[type]}  a [description]
             * @return {Boolean}   [description]
             */
             isEmptyObject: function(o, a) {
                for (a in o) {
                    // fun.call(thisArg[, arg1[, arg2[, ...]]])
                    if (utag.ut.hasOwn(o, a)) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * [isEmpty description]
             * @param  {[type]}  o [description]
             * @return {Boolean}   [description]
             */
             isEmpty: function(o) {
                var t = utag.ut.typeOf(o);
                if (t == 'number') {
                    return isNaN(o);
                } else if (t == 'boolean') {
                    return false;
                } else if (t == 'string') {
                    return o.length === 0;
                } else
                return utag.ut.isEmptyObject(o);
            },

            /**
             * [typeOf description]
             * @param  {[type]} e [description]
             * @return {[type]}   [description]
             */
             typeOf: function(e) {
                return ({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            },

            /**
             * [flatten description]
             * @param  {[type]} o [description]
             * @return {[type]}   [description]
             */
             flatten: function(o) {
                // stop when arriving at a string, array, boolean, number (float or integer)
                var a = {};

                /**
                 * [r description]
                 * @param  {[type]} c [description]
                 * @param  {[type]} p [description]
                 * @return {[type]}   [description]
                 */
                 function r(c, p) {
                    if (Object(c) !== c || c instanceof Array) {
                        a[p] = c;
                    } else {
                        if (utag.ut.isEmptyObject(c)) {
                            // commented out in original code, but empty block, so uncommented.
                            a[p] = {};
                        } else {
                            for (var d in c) {
                                r(c[d], p ? p + '.' + d : d);
                            }
                        }
                    }
                }
                // what the hell is r?
                r(o, '');
                return a;
            },

            /**
             * [merge description]
             * @param  {[type]} a [description]
             * @param  {[type]} b [description]
             * @param  {[type]} c [description]
             * @param  {[type]} d [description]
             * @return {[type]}   [description]
             */
             merge: function(a, b, c, d) {
                if (c) {
                    for (d in utag.loader.GV(b)) {
                        a[d] = b[d];
                    }
                } else {
                    for (d in utag.loader.GV(b)) {
                        if (typeof a[d] == 'undefined')
                            a[d] = b[d];
                    }
                }
            },
            /**
             * decodes string (a) passed to it.
             *
             * @param  {string} a :v_id:015703cfc3fc0016a350be0ce0b205077001606f0093c$_sn:1$_ss:1$_st:1473239530301$ses_id:1473237730301%3Bexp-session$_pn:1%3Bexp-session
             * @param  {string} b :v_id:015703cfc3fc0016a350be0ce0b205077001606f0093c$_sn:1$_ss:1$_st:1473239530301$ses_id:1473237730301;exp-session$_pn:1;exp-session
             * @return {string} b :returns decodedURI of a.
             */
             decode: function(a, b) {
                b = '';
                try {
                    b = decodeURIComponent(a);
                } catch (e) {
                    utag.DB(e);
                }
                if (b == '') {
                    b = unescape(a);
                }
                return b;
            },
            encode: function(a, b) {
                b = '';
                try {
                    b = encodeURIComponent(a);
                } catch (e) {
                    utag.DB(e);
                }
                if (b == '') {
                    b = escape(a);
                }
                return b;
            },
            error: function(a, b, c) {
                if (typeof utag_err != 'undefined') {
                    utag_err.push(a);
                }
            },

            /**
             * [loader description]
             *
             * @param  {[type]} o [description]
             * @param  {[type]} a [description]
             * @param  {[type]} b [description]
             * @param  {[type]} c [description]
             * @param  {[type]} l [description]
             * @param  {[type]} m [description]
             *
             * @return {[type]}   [description]
             */
             loader: function(o, a, b, c, l, m) {
                utag.DB(o);
                a = document;
                if (o.type == 'iframe') {
                    // if iframe of same ID already exists, just reset the src value (do not create a new iframe)
                    m = a.getElementById(o.id);
                    if (m && m.tagName == 'IFRAME') {
                        b = m;
                    } else {
                        b = a.createElement('iframe');
                    }
                    o.attrs = o.attrs || {};
                    utag.ut.merge(o.attrs, {
                        'height': '1',
                        'width': '1',
                        'style': 'display:none'
                    }, 0);
                } else if (o.type == 'img') {
                    utag.DB('Attach img: ' + o.src);
                    b = new Image();
                } else {
                    b = a.createElement('script');
                    b.language = 'javascript';
                    b.type = 'text/javascript';
                    b.async = 1;
                    b.charset = 'utf-8';
                }
                if (o.id) {
                    b.id = o.id;
                }
                for (l in utag.loader.GV(o.attrs)) {
                    b.setAttribute(l, o.attrs[l]);
                }
                b.setAttribute('src', o.src);
                if (typeof o.cb == 'function') {
                    if (b.addEventListener) {
                        b.addEventListener('load', function() {
                            o.cb();
                        }, false);
                    } else {
                        // old IE support
                        b.onreadystatechange = function() {
                            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                                this.onreadystatechange = null;
                                o.cb();
                            }
                        };
                    }
                }
                if (o.type != 'img' && !m) {
                    l = o.loc || 'head';
                    c = a.getElementsByTagName(l)[0];
                    if (c) {
                        utag.DB('Attach to ' + l + ': ' + o.src);
                        if (l == 'script') {
                            c.parentNode.insertBefore(b, c);
                        } else {
                            c.appendChild(b);
                        }
                    }
                }
            }
        }
    };
    utag.o['services-mauricio.main'] = utag;

    /**
     * contains utag script data.
     * @type {obj}
     */
     utag.cfg = {
        template: 'ut4.41.',
        // Enable load rules ajax feature by default
        load_rules_ajax: true,
        load_rules_at_wait: false,
        lowerqp: false,
        noconsole: false,
        // noview: ##UTNOVIEW##,
        session_timeout: 1800000,
        readywait: 1,
        noload: 0,
        domain: utag.loader.lh(),
        path: '//tags.tiqcdn.com/utag/services-mauricio/main/prod/',
        utid: 'services-mauricio/main/201609062336'
    };
    utag.cfg.v = utag.cfg.template + '201609062336';
    utag.cond = {};

    /**
     * map js_page variables.
     * @param  {obj} ud :local reference to utag.data
     */
     utag.pagevars = function(ud) {
        ud = ud || utag.data;
        try {
            ud['js_page.modus'] = modus;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.Prism.filename'] = Prism.filename;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.availWidth'] = screen.availWidth;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.availHeight'] = screen.availHeight;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.width'] = screen.width;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.height'] = screen.height;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.colorDepth'] = screen.colorDepth;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.pixelDepth'] = screen.pixelDepth;
        } catch (e) {
            utag.DB(e);
        }
        try {
            ud['js_page.screen.availLeft'] = screen.availLeft;
        } catch (e) {
            utag.DB(e);
        }
    };

    /**
     * initializes utag.data if non present on page.
     * called during loader stage when when !utag.data=true.
     */
     utag.loader.initdata = function() {
        try {
            // if utag_data is present on then utag.data equals utag_data;
            // if it's not. Just initialize utag.data to an {};
            utag.data = (typeof utag_data != 'undefined') ? utag_data : {};
            // set default UDO variable name
            utag.udoname = 'utag_data';
        } catch (e) {
            utag.data = {};
            utag.DB('idf:' + e);
        }
    };

    /**
     * loadrule definitions
     * @param  {[type]} _pd [description]
     * @param  {[type]} _pc [description]
     * @return {[type]}     [description]
     */
     utag.loader.loadrules = function(_pd, _pc) {
        var d = _pd || utag.data;
        var c = _pc || utag.cond;
        for (var l in utag.loader.GV(c)) {
            switch (l) {}
        }
    };

    /**
     * Retrieves the page's data, such as: JavaScript page variables, DOM data, cookies values, and meta tags.
     * Evaluates load rules.
     * Declares the 'All Tags'-scoped Extensions, which will run later.
     */
     utag.pre = function() {
        // if utag_data exists, utag.data = utag_data;
        utag.loader.initdata();
        utag.pagevars();
        try {
            utag.loader.RD(utag.data);
        } catch (e) {
            utag.DB(e);
        }
        utag.loader.loadrules();
    };
    utag.loader.GET = function() {
        utag.cl = {
            '_all_': 1
        };

        utag.pre();
        utag.handler.extend = [];
        utag.handler.cfg_extend = [];
        utag.loader.initcfg = function() {
            utag.loader.cfg = {};
            // force loading sort for chrome
            // a fix for browsers like Chrome that overwrite the order that tags should fire
            utag.loader.cfgsort = [];
        };
        utag.loader.initcfg();
    };
    if (typeof utag_cfg_ovrd != 'undefined') {
        for (var i in utag.loader.GV(utag_cfg_ovrd))
            utag.cfg[i] = utag_cfg_ovrd[i];
    }

    /**
     * [PINIT description]
     *
     * @param {[type]} a [description]
     * @param {[type]} b [description]
     * @param {[type]} c [description]
     */
     utag.loader.PINIT = function(a, b, c) {
        utag.DB('Pre-INIT');
        if (utag.cfg.noload) {
            return;
        }
        try {
            // Initialize utag.data
            this.GET();
            // Even if noview flag is set, we still want to load in tags and have them ready to fire
            // FUTURE: blr = "before load rules"
            if (utag.handler.RE('view', utag.data, 'blr')) {
                utag.handler.LR(utag.data);
            }
        } catch (e) {
            utag.DB(e);
        }
        // process 'blocking' tags (tags that need to run first)
        a = this.cfg;
        c = 0;
        for (b in this.GV(a)) {
            // external .js files (currency converter tag) are blocking
            if (a[b].block == 1 || (a[b].load > 0 && (typeof a[b].src != 'undefined' && a[b].src != ''))) {
                a[b].block = 1;
                c = 1;
                this.bq[b] = 1;
            }
        }
        if (c == 1) {
            for (b in this.GV(a)) {
                if (a[b].block) {
                    // handle case of bundled and blocking (change 4 to 1)
                    // (bundled tags that do not have a .src should really never be set to block... they just run first)
                    a[b].id = b;
                    if (a[b].load == 4)
                        a[b].load = 1;
                    a[b].cb = function() {
                        var d = this.uid;
                        utag.loader.cfg[d].cbf = 1;
                        utag.loader.LOAD(d);
                    };
                    this.AS(a[b]);
                }
            }
        }
        if (c == 0)
            this.INIT();
    };
    utag.loader.INIT = function(a, b, c, d, e) {
        utag.DB('utag.loader.INIT');
        if (this.ol == 1)
            return -1;
        else
            this.ol = 1;
        // The All Tags scope extensions run after blocking tags complete
        // The noview flag means to skip these Extensions (will run later for manual utag.view call)
        if (utag.cfg.noview != true)
            utag.handler.RE('view', utag.data, 'alr');
        utag.rpt.ts['i'] = new Date();
        d = this.cfgsort;
        // TODO: Publish engine should sort the bundled tags first..
        for (a = 0; a < d.length; a++) {
            e = d[a];
            b = this.cfg[e];
            b.id = e;
            // s2s (ServerStream) tags do not load client-side
            if (b.block != 1 && b.s2s != 1) {
                // do not wait if the utag.cfg.noview flag is set and the tag is bundled
                if (utag.loader.bk[b.id] || ((utag.cfg.readywait || utag.cfg.noview) && b.load == 4)) {
                    this.f[b.id] = 0;
                    utag.loader.LOAD(b.id);
                } else if (b.wait == 1 && utag.loader.rf == 0) {
                    utag.DB('utag.loader.INIT: waiting ' + b.id);
                    this.wq.push(b);
                    this.f[b.id] = 2;
                } else if (b.load > 0) {
                    utag.DB('utag.loader.INIT: loading ' + b.id);
                    this.lq.push(b);
                    this.AS(b);
                }
            }
        }
        if (this.wq.length > 0)
            utag.loader.EV('', 'ready', function(a) {
                if (utag.loader.rf == 0) {
                    utag.DB('READY:utag.loader.wq');
                    utag.loader.rf = 1;
                    utag.loader.WQ();
                }
            });
        else if (this.lq.length > 0)
            utag.loader.rf = 1;
        else if (this.lq.length == 0)
            utag.loader.END();
        return 1;
    };
    if (utag.cfg.readywait || utag.cfg.waittimer) {
        // calls utag loader with b="ready"
        utag.loader.EV('', 'ready', function(a) {
            if (utag.loader.rf == 0) {
                utag.loader.rf = 1;
                utag.cfg.readywait = 1;
                utag.DB('READY:utag.cfg.readywait');
                setTimeout(function() {
                    utag.loader.PINIT();
                }, utag.cfg.waittimer || 1);
            }
        });
    } else {
        utag.loader.PINIT();
    }
}
