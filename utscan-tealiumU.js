{
    "id": "tu-partner-us.apt040",
    "o": {},
    "sender": {
        "1": {
            "ev": {
                "all": 1
            },
            "server_domain": "tealiumiq.com",
            "server_prefix": "//tmu-",
            "tag_config_server": "//tmu-collect.tealiumiq.com/tu-partner-us/main/2/i.gif",
            "tag_config_sampling": "100",
            "tag_config_region": "default",
            "region": "us-east-1",
            "performance_timing_count": 4,
            "account": "tu-partner-us",
            "profile": "apt040",
            "data_enrichment": "frequent",
            "profile_specific_vid": 1,
            "enrichment_polling": 1,
            "enrichment_polling_delay": 1000,
            "do_enrichment": function(server, enrichment_polling, enrichment_polling_delay) {
                if (typeof utag.ut.loader != "undefined") {
                    for (var i = 0; i < enrichment_polling; i++) {
                        setTimeout(function() {
                            u.visitor_service_request((new Date).getTime(), server)
                        }, i * enrichment_polling_delay + 1);
                    }
                }
            },
            "server_list": ["//tmu-collect-us-east-1.tealiumiq.com/tu-partner-us/main/2/i.gif", "//tmu-collect-us-east-1.tealiumiq.com/tealiumuniversity/skilljar-dv/2/i.gif"],
            "enrichment_enabled": {
                "1": false,
                "//tmu-collect-us-east-1.tealiumiq.com/tu-partner-us/main/2/i.gif": true
            },
            "get_account_profile": function(s) {
                var p = s.substring(s.indexOf(u.server_domain)).split("/");
                return p;
            },
            "is_in_sample_group": function(b) {
                var group = "100";
                if (u.tag_config_sampling === "" || u.tag_config_sampling === "100") {
                    return true
                }
                if (b["cp.utag_main_dc_group"]) {
                    group = b["cp.utag_main_dc_group"];
                } else {
                    group = Math.floor(Math.random() * 100) + 1;
                    utag.loader.SC("utag_main", {
                        "dc_group": group
                    });
                }
                if (parseInt(group) <= parseInt(u.tag_config_sampling)) {
                    return true
                } else {
                    return false
                }
            },
            "get_performance_timing": function(b) {
                var t, timing;
                var data = {};

                function subtract(val1, val2) {
                    var difference = 0;
                    if (val1 > val2) {
                        difference = val1 - val2;
                    }
                    return difference;
                }
                if (typeof localStorage != "undefined" && JSON.parse && window.performance && window.performance.timing) {
                    t = window.performance.timing;
                    timing = localStorage.getItem("tealium_timing");
                    if (timing !== null && timing !== "{}" && typeof b !== "undefined" && u.performance_timing_count === 0) {
                        utag.ut.merge(b, utag.ut.flatten({
                            timing: JSON.parse(timing)
                        }), 1);
                    }
                } else {
                    return;
                }
                u.performance_timing_count++;
                for (var k in t) {
                    if ((k.indexOf("dom") === 0 || k.indexOf("load") === 0) && t[k] === 0 && u.performance_timing_count < 20) {
                        setTimeout(u.get_performance_timing, 1000);
                    }
                }
                data["domain"] = location.hostname + "";
                data["pathname"] = location.pathname + "";
                data["query_string"] = ("" + location.search).substring(1);
                data["timestamp"] = (new Date()).getTime();
                data["dns"] = subtract(t.domainLookupEnd, t.domainLookupStart);
                data["connect"] = subtract(t.connectEnd, t.connectStart);
                data["response"] = subtract(t.responseEnd, t.responseStart);
                data["dom_loading_to_interactive"] = subtract(t.domInteractive, t.domLoading);
                data["dom_interactive_to_complete"] = subtract(t.domComplete, t.domInteractive);
                data["load"] = subtract(t.loadEventEnd, t.loadEventStart);
                data["time_to_first_byte"] = subtract(t.responseStart, t.connectEnd);
                data["front_end"] = subtract(t.loadEventStart, t.responseEnd);
                data["fetch_to_response"] = subtract(t.responseStart, t.fetchStart);
                data["fetch_to_complete"] = subtract(t.domComplete, t.fetchStart);
                data["fetch_to_interactive"] = subtract(t.domInteractive, t.fetchStart);
                try {
                    localStorage.setItem("tealium_timing", JSON.stringify(data));
                } catch (e) {
                    utag.DB(e)
                }
            },
            "map": {},
            "extend": [function(a, b) {
                u.server_list.push("//tmu-collect.tealiumiq.com/tealiumuniversity/skilljar-dv/2/i.gif");
                u.enrichment_enabled[1] = false;
            }],
            "send": function(a, b, c, d, e, f) {
                if (u.ev[a] || typeof u.ev["all"] != "undefined") {
                    u.make_enrichment_request = false;
                    for (c = 0; c < u.extend.length; c++) {
                        try {
                            d = u.extend[c](a, b);
                            if (d == false) return
                        } catch (e) {}
                    };
                    if (!u.is_in_sample_group(b)) {
                        return false
                    }
                    u.get_performance_timing(b);
                    for (var i = 0; i < u.server_list.length; i++) {
                        if (b["cp.utag_main_dc_region"]) {
                            u.region = b["cp.utag_main_dc_region"];
                            u.server_list[i] = u.server_list[i].replace("datacloud.", "datacloud-" + u.region + ".");
                            u.server_list[i] = u.server_list[i].replace("collect.", "collect-" + u.region + ".");
                        }
                        if (u.enrichment_enabled[i] !== false) {
                            u.enrichment_enabled[u.server_list[i]] = true
                        }
                    }
                    if (u.server_list.length > 1) {
                        u.profile_specific_vid = 1;
                    }
                    u.data = utag.datacloud || {};
                    u.data["loader.cfg"] = {};
                    for (d in utag.loader.GV(utag.loader.cfg)) {
                        if (utag.loader.cfg[d].load && utag.loader.cfg[d].send) {
                            utag.loader.cfg[d].executed = 1;
                        } else {
                            utag.loader.cfg[d].executed = 0;
                        }
                        u.data["loader.cfg"][d] = utag.loader.GV(utag.loader.cfg[d]);
                    }
                    u.data.data = b;
                    for (d in u.data.data) {
                        if ((d + '').indexOf("qp.") == 0) {
                            u.data.data[d] = encodeURIComponent(u.data.data[d]);
                        } else if ((d + '').indexOf("va.") == 0) {
                            delete u.data.data[d]
                        }
                    }
                    if (!b["cp.utag_main_dc_event"]) {
                        b["cp.utag_main_dc_visit"] = (1 + (b["cp.utag_main_dc_visit"] ? parseInt(b["cp.utag_main_dc_visit"]) : 0)) + '';
                    }
                    b["cp.utag_main_dc_event"] = (1 + (b["cp.utag_main_dc_event"] ? parseInt(b["cp.utag_main_dc_event"]) : 0)) + '';
                    utag.loader.SC("utag_main", {
                        "dc_visit": b["cp.utag_main_dc_visit"],
                        "dc_event": b["cp.utag_main_dc_event"] + ";exp-session"
                    });
                    utag.data["cp.utag_main_dc_visit"] = b["cp.utag_main_dc_visit"];
                    utag.data["cp.utag_main_dc_event"] = b["cp.utag_main_dc_event"];
                    var dt = new Date();
                    u.data.browser = {};
                    try {
                        u.data.browser["height"] = window.innerHeight || document.body.clientHeight;
                        u.data.browser["width"] = window.innerWidth || document.body.clientWidth;
                        u.data.browser["screen_height"] = screen.height;
                        u.data.browser["screen_width"] = screen.width;
                        u.data.browser["timezone_offset"] = dt.getTimezoneOffset();
                    } catch (e) {
                        utag.DB(e)
                    }
                    u.data["event"] = a + '';
                    u.data["post_time"] = dt.getTime();
                    if (u.data_enrichment == "frequent" || u.data_enrichment == "infrequent") {
                        u.visit_num = b["cp.utag_main_dc_visit"];
                        if (parseInt(u.visit_num) > 1 && b["cp.utag_main_dc_event"] == "1") {
                            u.enrichment_polling = 2;
                        }
                        try {
                            u.va_update = parseInt(localStorage.getItem("tealium_va_update") || 0);
                        } catch (e) {
                            utag.DB(e)
                        }
                        u.visitor_id = u.visitor_id || b["cp.utag_main_v_id"];
                        if ((u.data_enrichment == "frequent" && !(u.visit_num == "1" && b["cp.utag_main_dc_event"] == "1")) || (u.data_enrichment == "infrequent" && parseInt(u.visit_num) > 1 && parseInt(b["cp.utag_main_dc_event"]) <= 5 && u.visit_num != u.va_update)) {
                            u.make_enrichment_request = true;
                        } else if (b._corder) {
                            u.make_enrichment_request = true;
                            u.enrichment_polling = 3;
                            u.enrichment_polling_delay = 4000;
                        }
                        u.visitor_service_request = function(t, server) {
                            var s = "https://" + u.server_prefix + "visitor-service" + (u.region ? "-" + u.region : "") + "." + u.server_domain;
                            var p = u.get_account_profile(server);
                            (function(p) {
                                var prefix = "tealium_va";
                                var key = "_" + p[1] + "_" + p[2];
                                utag.ut["writeva" + p[2]] = function(o) {
                                    utag.DB("Visitor Attributes: " + prefix + key);
                                    utag.DB(o)
                                    var str = JSON.stringify(o);
                                    if (str != "{}" && str != "") {
                                        try {
                                            localStorage.setItem('tealium_va_update', utag.data["cp.utag_main_dc_visit"]);
                                            localStorage.setItem(prefix, str);
                                            localStorage.setItem(prefix + key, str);
                                        } catch (e) {
                                            utag.DB(e)
                                        }
                                        if (typeof tealium_enrichment == "function") {
                                            tealium_enrichment(o, prefix + key);
                                        }
                                    }
                                }
                            }(p.slice(0)))
                            var vid = u.visitor_id;
                            if (u.profile_specific_vid == 1) {
                                vid += p[2];
                            }
                            utag.ut.loader({
                                id: "tealium_visitor_service_1" + p[2],
                                src: s + "/" + p[1] + "/" + p[2] + "/" + vid + "?callback=utag.ut%5B%22writeva" + p[2] + "%22%5D&rnd=" + t
                            });
                        }
                        u.do_enrichment = function(server, enrichment_polling, enrichment_polling_delay) {
                            if (typeof utag.ut.loader != "undefined") {
                                for (var i = 0; i < enrichment_polling; i++) {
                                    setTimeout(function() {
                                        u.visitor_service_request((new Date).getTime(), server)
                                    }, i * enrichment_polling_delay + 1);
                                }
                            }
                        }
                    }
                    var json_string;
                    var regExpReplace = new RegExp(u.visitor_id, "g");
                    if (window.FormData) {
                        function postData(server_index, enrichment_polling, enrichment_polling_delay) {
                            if (server_index + 1 > u.server_list.length) {
                                return;
                            }
                            var xhr = new XMLHttpRequest();
                            var server = u.server_list[server_index];
                            var formData = new FormData();
                            xhr.addEventListener('readystatechange', function() {
                                if (xhr.readyState === 3) {
                                    try {
                                        u.region = xhr.getResponseHeader("X-Region") || u.region || "";
                                    } catch (res_error) {
                                        utag.DB(res_error);
                                        u.region = u.region || "";
                                    }
                                    if (u.region) utag.loader.SC("utag_main", {
                                        "dc_region": u.region + ";exp-session"
                                    });
                                    utag.DB("dc_region:" + u.region);
                                } else if (xhr.readyState === 4) {
                                    postData(server_index + 1, enrichment_polling, enrichment_polling_delay);
                                    if (u.make_enrichment_request && u.enrichment_enabled[server]) u.do_enrichment(server, enrichment_polling, enrichment_polling_delay);
                                }
                            });
                            xhr.open('post', u.server_list[server_index], true);
                            xhr.withCredentials = true;
                            json_string = JSON.stringify(u.data);
                            if (u.profile_specific_vid == 1) {
                                json_string = json_string.replace(regExpReplace, u.visitor_id + u.get_account_profile(server)[2]);
                            }
                            formData.append("data", json_string);
                            xhr.send(formData);
                        }
                        postData(0, u.enrichment_polling, u.enrichment_polling_delay);
                    } else {
                        for (var i = 0; i < u.server_list.length; i++) {
                            (function(i, enrichment_polling, enrichment_polling_delay) {
                                var server = u.server_list[i];
                                setTimeout(function() {
                                    json_string = JSON.stringify(u.data);
                                    if (u.profile_specific_vid == 1) {
                                        json_string = json_string.replace(regExpReplace, u.visitor_id + u.get_account_profile(server)[2]);
                                    }
                                    var img = new Image();
                                    img.src = server + '?data=' + encodeURIComponent(json_string);
                                    if (u.make_enrichment_request && u.enrichment_enabled[server]) u.do_enrichment(server, enrichment_polling, enrichment_polling_delay);
                                }, i * 700);
                            }(i, u.enrichment_polling, u.enrichment_polling_delay))
                        }
                    }
                }
            },
            "make_enrichment_request": true,
            "data": {
                "loader.cfg": {
                    "1": {
                        "load": 1,
                        "send": 1,
                        "v": 201609091909,
                        "wait": 1,
                        "tid": 20064,
                        "executed": 1
                    },
                    "2": {
                        "load": 1,
                        "send": 1,
                        "v": 201609131614,
                        "wait": 1,
                        "tid": 7110,
                        "executed": 1
                    },
                    "3": {
                        "load": 1,
                        "send": 1,
                        "v": 201609131614,
                        "wait": 1,
                        "tid": 4001,
                        "executed": 1
                    },
                    "5": {
                        "load": 0,
                        "send": 1,
                        "v": 201609132100,
                        "wait": 1,
                        "tid": 7117,
                        "executed": 0
                    }
                },
                "data": {
                    "page_name": "SwellPrints - Kelly Slater",
                    "page_category": "Products -- Lower Trestles, CA",
                    "page_type": "product_detail_page",
                    "order_currency": "USD",
                    "customer_country": "US",
                    "product_name": ["Kelly Slater Doing What He Does"],
                    "product_id": ["ks-01"],
                    "product_sku": ["lws-ks-01"],
                    "product_unit_price": ["34.99"],
                    "product_category": ["Lowers"],
                    "product_subcategory": ["Kelly Slater"],
                    "product_image_url": ["http://assets.tagthis.co/products/thumbnails/kelly_500px.jpg"],
                    "product_url": ["http://tagthis.co/buy_kelly.html"],
                    "cp.utag_main_v_id": "0157245451240027bf5a1200832c05077002806f0093c",
                    "cp.utag_main__sn": "5",
                    "cp.utag_main__ss": "0",
                    "cp.utag_main__st": "1473807647683",
                    "cp.utag_main_dc_visit": "5",
                    "cp.utag_main_ses_id": "1473804144079",
                    "cp.utag_main__pn": "3",
                    "cp.utag_main_dc_event": "3",
                    "cp.utag_main_dc_region": "us-east-1",
                    "cp.utag_main_stored_gclid": "CMPPng5ljiCFc6TL",
                    "cp._ga": "GA1.2.411902962.1473786856",
                    "cp.swCart": "active",
                    "cp.swProds": "Kelly%20Slater%20Doing%20What%20He%20Does",
                    "cp.swQty": "1",
                    "cp.swSku": "lws-ks-01",
                    "cp.swPrice": "34.99",
                    "cp.swCat": "Lowers",
                    "cp.swShip": "7.99",
                    "cp.swPid": "ks-01",
                    "cp.swScat": "Kelly%20Slater",
                    "cp.swQCart": "34.99",
                    "cp.folder": "tmu",
                    "cp.account": "tu-partner-us",
                    "cp.profile": "apt040",
                    "cp.env": "prod",
                    "cp.t_ID": "097109117206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206143143143206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206206194214211202196202208143194207197211194197198212",
                    "qp.utm_campaign": "Kelly",
                    "qp.utm_source": "google",
                    "qp.utm_medium": "cpc",
                    "qp.utm_term": "Kelly%20Slater",
                    "qp.gclid": "CMPPng5ljiCFc6TL",
                    "meta.description": "",
                    "meta.author": "",
                    "dom.referrer": "http://tagthis.co/google/",
                    "dom.title": "SwellPrints - Kelly Slater with a Massive Boost at Lower Trestles, California, USA",
                    "dom.domain": "tagthis.co",
                    "dom.query_string": "utm_campaign=Kelly&utm_source=google&utm_medium=cpc&utm_term=Kelly%20Slater&gclid=CMPPng5ljiCFc6TL",
                    "dom.hash": "",
                    "dom.url": "http://tagthis.co/buy_kelly.html?utm_campaign=Kelly&utm_source=google&utm_medium=cpc&utm_term=Kelly%20Slater&gclid=CMPPng5ljiCFc6TL#",
                    "dom.pathname": "/buy_kelly.html",
                    "dom.viewport_height": 826,
                    "dom.viewport_width": 555,
                    "ut.domain": "",
                    "ut.version": "ut4.42.201609132206",
                    "ut.event": "view",
                    "ut.visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
                    "ut.session_id": "1473804144079",
                    "ut.account": "tu-partner-us",
                    "ut.profile": "apt040",
                    "ut.env": "prod",
                    "tealium_event": "view",
                    "tealium_visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
                    "tealium_session_id": "1473804144079",
                    "tealium_datasource": "",
                    "tealium_account": "tu-partner-us",
                    "tealium_profile": "apt040",
                    "tealium_environment": "prod",
                    "tealium_random": "8855634907385064",
                    "tealium_library_name": "utag.js",
                    "tealium_library_version": "4.42.0",
                    "tealium_timestamp_epoch": 1473805848,
                    "tealium_timestamp_utc": "2016-09-13T22:30:48.616Z",
                    "tealium_timestamp_local": "2016-09-13T15:30:48.616",
                    "_ccity": "",
                    "_ccountry": "US",
                    "_ccurrency": "USD",
                    "_ccustid": "",
                    "_corder": "",
                    "_cpromo": "",
                    "_cship": "",
                    "_cstate": "",
                    "_cstore": "",
                    "_csubtotal": "",
                    "_ctax": "",
                    "_ctotal": "",
                    "_ctype": "",
                    "_czip": "",
                    "_cprod": ["ks-01"],
                    "_cprodname": ["Kelly Slater Doing What He Does"],
                    "_cbrand": [],
                    "_ccat": ["Lowers"],
                    "_ccat2": ["Kelly Slater"],
                    "_cquan": [],
                    "_cprice": ["34.99"],
                    "_csku": ["lws-ks-01"],
                    "_cpdisc": [],
                    "dblclk_category": "tealkelly",
                    "timing.domain": "tagthis.co",
                    "timing.pathname": "/buy_kelly.html",
                    "timing.query_string": "utm_campaign=Kelly&utm_source=google&utm_medium=cpc&utm_term=Kelly%20Slater&gclid=CMPPng5ljiCFc6TL",
                    "timing.timestamp": 1473805485493,
                    "timing.dns": 1,
                    "timing.connect": 34,
                    "timing.response": 2,
                    "timing.dom_loading_to_interactive": 0,
                    "timing.dom_interactive_to_complete": 1473805485460,
                    "timing.load": 0,
                    "timing.time_to_first_byte": 67,
                    "timing.front_end": 0,
                    "timing.fetch_to_response": 111,
                    "timing.fetch_to_complete": 10446,
                    "timing.fetch_to_interactive": 0
                },
                "browser": {
                    "height": 826,
                    "width": 555,
                    "screen_height": 900,
                    "screen_width": 1440,
                    "timezone_offset": 420
                },
                "event": "view",
                "post_time": 1473805853486
            },
            "visit_num": "5",
            "va_update": 5,
            "visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
            "visitor_service_request": function(t, server) {
                var s = "https://" + u.server_prefix + "visitor-service" + (u.region ? "-" + u.region : "") + "." + u.server_domain;
                var p = u.get_account_profile(server);
                (function(p) {
                    var prefix = "tealium_va";
                    var key = "_" + p[1] + "_" + p[2];
                    utag.ut["writeva" + p[2]] = function(o) {
                        utag.DB("Visitor Attributes: " + prefix + key);
                        utag.DB(o)
                        var str = JSON.stringify(o);
                        if (str != "{}" && str != "") {
                            try {
                                localStorage.setItem('tealium_va_update', utag.data["cp.utag_main_dc_visit"]);
                                localStorage.setItem(prefix, str);
                                localStorage.setItem(prefix + key, str);
                            } catch (e) {
                                utag.DB(e)
                            }
                            if (typeof tealium_enrichment == "function") {
                                tealium_enrichment(o, prefix + key);
                            }
                        }
                    }
                }(p.slice(0)))
                var vid = u.visitor_id;
                if (u.profile_specific_vid == 1) {
                    vid += p[2];
                }
                utag.ut.loader({
                    id: "tealium_visitor_service_1" + p[2],
                    src: s + "/" + p[1] + "/" + p[2] + "/" + vid + "?callback=utag.ut%5B%22writeva" + p[2] + "%22%5D&rnd=" + t
                });
            }
        },
        "2": {
            "loader": function(o, a, b, c, l, m) {
                utag.DB(o);
                a = document;
                if (o.type == "iframe") {
                    m = a.getElementById(o.id);
                    if (m && m.tagName == "IFRAME") {
                        b = m;
                    } else {
                        b = a.createElement("iframe");
                    }
                    o.attrs = o.attrs || {};
                    utag.ut.merge(o.attrs, {
                        "height": "1",
                        "width": "1",
                        "style": "display:none"
                    }, 0);
                } else if (o.type == "img") {
                    utag.DB("Attach img: " + o.src);
                    b = new Image();
                } else {
                    b = a.createElement("script");
                    b.language = "javascript";
                    b.type = "text/javascript";
                    b.async = 1;
                    b.charset = "utf-8";
                }
                if (o.id) {
                    b.id = o.id
                };
                for (l in utag.loader.GV(o.attrs)) {
                    b.setAttribute(l, o.attrs[l])
                }
                b.setAttribute("src", o.src);
                if (typeof o.cb == "function") {
                    if (b.addEventListener) {
                        b.addEventListener("load", function() {
                            o.cb()
                        }, false);
                    } else {
                        b.onreadystatechange = function() {
                            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                                this.onreadystatechange = null;
                                o.cb()
                            }
                        };
                    }
                }
                if (o.type != "img" && !m) {
                    l = o.loc || "head";
                    c = a.getElementsByTagName(l)[0];
                    if (c) {
                        utag.DB("Attach to " + l + ": " + o.src);
                        if (l == "script") {
                            c.parentNode.insertBefore(b, c);
                        } else {
                            c.appendChild(b)
                        }
                    }
                }
            },
            "typeOf": function(e) {
                return ({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            },
            "ev": {
                "view": 1,
                "link": 1
            },
            "o": function() {
                (window[window.GoogleAnalyticsObject].q = window[window.GoogleAnalyticsObject].q || []).push(arguments);
            },
            "required": {},
            "created": true,
            "all": function(e, o, v, a, b) {
                for (var i = 0; i < u.data.account.length; i++) {
                    var t = (u.data.name[i] ? u.data.name[i] + "." : "");
                    if (o === "event") {
                        u.o(t + e, o, v, a, b)
                    } else if (v) {
                        u.o(t + e, o, v)
                    } else {
                        u.o(t + e, o);
                    }
                }
            },
            "setHitData": function(g, a, b, f) {
                var obj = u.data[a];
                for (var d in utag.loader.GV(obj)) {
                    if (b && d.indexOf("enh_" + b + "-") !== 0 && d.indexOf("enh_all-") !== 0) {
                        continue;
                    }
                    var idx = d.split("-")[1],
                        val = obj[d];
                    if (u.typeOf(val) !== "array") {
                        g[idx] = val;
                    } else {
                        g[idx] = val[f];
                    }
                }
            },
            "addEvent": function(v) {
                if (typeof v.eventCategory == "undefined" || typeof v.eventAction == "undefined") {
                    utag.DB("GA event Category or Action is not set");
                    return;
                }
                if (isNaN(parseInt(v.eventValue))) {
                    utag.DB("GA event Value is not a number");
                    v.eventValue = null;
                } else {
                    v.eventValue = parseInt(v.eventValue) || null;
                }
                u.data.ga_events.push(v);
            },
            "addproduct": function(event_type, len, imp) {
                var g = {},
                    i, j, k = [];
                if (imp === true) {
                    k = (u.data.enh_impression_id.length ? u.data.enh_impression_id : u.data.enh_impression_name);
                    for (i = 0; i < k.length; i++) {
                        g = {};
                        g.id = (u.data.enh_impression_id[i] ? u.data.enh_impression_id[i] : "");
                        g.name = (u.data.enh_impression_name[i] ? u.data.enh_impression_name[i] : "");
                        g.brand = (u.data.enh_impression_brand[i] ? u.data.enh_impression_brand[i] : "");
                        g.variant = (u.data.enh_impression_variant[i] ? u.data.enh_impression_variant[i] : "");
                        g.category = (u.data.enh_impression_category[i] ? u.data.enh_impression_category[i] : "");
                        g.list = (u.data.enh_impression_list[i] ? u.data.enh_impression_list[i] : "");
                        g.price = (u.data.enh_impression_price[i] ? u.data.enh_impression_price[i] : "");
                        g.position = (u.data.enh_impression_position[i] ? u.data.enh_impression_position[i] : "");
                        u.setHitData(g, "enhecom_events", event_type, i);
                        u.all('ec:addImpression', g);
                    }
                } else {
                    for (i = 0; i < len; i++) {
                        g = {};
                        if (u.data.autofill_params === "true") {
                            for (j = 0; j < u.data.product_id.length; j++) {
                                u.data.product_name[j] = u.data.product_name[j] || u.data.product_id[j];
                                u.data.product_unit_price[j] = u.data.product_unit_price[j] || "1.00";
                                u.data.product_quantity[j] = u.data.product_quantity[j] || "1";
                            }
                        }
                        g.id = u.data.product_id[i];
                        g.name = (u.data.product_name[i] ? u.data.product_name[i] : "");
                        g.brand = (u.data.product_brand[i] ? u.data.product_brand[i] : "");
                        g.variant = (u.data.product_variant[i] ? u.data.product_variant[i] : "");
                        g.category = (u.data.product_category[i] ? u.data.product_category[i] : "");
                        g.price = (u.data.product_unit_price[i] ? u.data.product_unit_price[i] : "");
                        g.quantity = (u.data.product_quantity[i] ? u.data.product_quantity[i] : "");
                        g.coupon = (u.data.product_discount[i] ? u.data.product_discount[i] : "");
                        g.position = (u.data.product_position[i] ? u.data.product_position[i] : "");
                        u.setHitData(g, "enhecom_events", event_type, i);
                        u.all('ec:addProduct', g);
                    }
                }
            },
            "addpromo": function(action, event) {
                var f, g;
                for (f = 0; f < u.data.enh_promo_id.length; f++) {
                    g = {};
                    g.id = u.data.enh_promo_id[f];
                    g.name = (u.data.enh_promo_name[f] ? u.data.enh_promo_name[f] : u.data.enh_promo_id[f]);
                    g.creative = (u.data.enh_promo_creative[f] ? u.data.enh_promo_creative[f] : "");
                    g.position = (u.data.enh_promo_position[f] ? u.data.enh_promo_position[f] : "");
                    u.all('ec:addPromo', g);
                }
                if (action === "promo_click" && event === "link") {
                    u.all('ec:setAction', u.data.enh_action);
                    if (u.data.autosend_events === "true") {
                        u.all('send', 'event', 'Internal Promotions', 'click', (g.name ? g.name : g.id));
                    }
                }
            },
            "createTracker": function() {
                if (u.typeOf(u.data.account) === "string") {
                    u.data.account = u.data.account.replace(/\s/g, "").split(",");
                }
                if (u.typeOf(u.data.name) === "string" && u.data.name !== "") {
                    u.data.name = u.data.name.replace(/\s/g, "").split(",");
                }
                if (!u.data.name || u.data.name.length !== u.data.account.length) {
                    var start = u.data.name.length !== u.data.account.length ? u.data.name.length : 0;
                    tn = utag.tagsettings.gua.trackernames;
                    u.data.name = u.data.name || [];
                    for (i = start; i < u.data.account.length; i++) {
                        u.data.name.push("tealium_" + (i + tn));
                    }
                    utag.tagsettings.gua.trackernames = tn + i;
                }
            },
            "initTracker": function() {
                var c;
                if (!u.created) {
                    u.created = true;
                    for (f = 0; f < u.data.account.length; f++) {
                        c = {};
                        if (u.data.siteSpeedSampleRate) {
                            c.siteSpeedSampleRate = parseInt(u.data.siteSpeedSampleRate);
                        }
                        if (u.data.sampleRate) {
                            c.sampleRate = parseFloat(u.data.sampleRate);
                        }
                        c.cookieDomain = u.data.cookieDomain;
                        if (u.data.cookieExpires || u.data.cookieExpires === "0") {
                            c.cookieExpires = parseInt(u.data.cookieExpires);
                        }
                        if (u.data.legacyCookieDomain) {
                            c.legacyCookieDomain = u.data.legacyCookieDomain;
                        }
                        c.allowLinker = u.data.allowLinker;
                        if (typeof u.data.name[f] !== "undefined" && u.data.name[f] !== "") {
                            c.name = u.data.name[f];
                        }
                        u.o("create", u.data.account[f], c);
                    }
                    if (u.data.optimizely === "true") {
                        window.optimizely = window.optimizely || [];
                        window.optimizely.push(['activateUniversalAnalytics']);
                    }
                }
            },
            "map": {
                "page_name": "title,link-dimension10",
                "event_name": "eventAction",
                "event_category": "eventCategory",
                "event_attr_1": "eventLabel"
            },
            "extend": [],
            "send": function(a, b) {
                if (u.ev[a] || u.ev.all !== undefined) {
                    u.o = window[window.GoogleAnalyticsObject];
                    b.ga_events = b.ga_events || [];
                    var c, d, e, f, g, tn, prop;
                    if (u.data && u.data.name) {
                        tn = u.data.name;
                    }
                    u.data = {
                        "qsp_delim": "&",
                        "kvp_delim": "=",
                        "base_url": "",
                        "a": a,
                        "cookieDomain": "" || utag.loader.lh(),
                        "name": tn || "",
                        "account": "UA-12345678-1",
                        "anonymizeIp": "false",
                        "allowLinker": "false",
                        "crossDomainTrack": "",
                        "enhancedLinkAttribution": "false",
                        "enhancedecommerce": "false",
                        "displayfeatures": "false",
                        "screenView": "false",
                        "optimizely": "false",
                        "init_before_extensions": "false",
                        "autofill_params": "false",
                        "autosend_events": "true" || "true",
                        "enh_action": "",
                        "enh_event_cb": "",
                        "enh_checkout_step": "",
                        "enh_checkout_option": "",
                        "product_action_list": "",
                        "product_variant": [],
                        "enh_impression_id": [],
                        "enh_impression_name": [],
                        "enh_impression_price": [],
                        "enh_impression_category": [],
                        "enh_impression_brand": [],
                        "enh_impression_variant": [],
                        "enh_impression_list": [],
                        "enh_impression_position": [],
                        "enh_promo_id": [],
                        "enh_promo_name": [],
                        "enh_promo_creative": [],
                        "enh_promo_position": [],
                        "id": "",
                        "product_id": [],
                        "product_name": [],
                        "product_brand": [],
                        "product_category": [],
                        "product_quantity": [],
                        "product_unit_price": [],
                        "product_discount": [],
                        "product_position": [],
                        "ga_events": [],
                        "sessionControl": "",
                        "set": {}
                    };
                    if (u.data.init_before_extensions === "true") {
                        u.createTracker();
                        u.initTracker();
                    }
                    c = [];
                    for (d in utag.loader.GV(u.map)) {
                        if (b[d] !== undefined && b[d] !== "") {
                            e = u.map[d].split(",");
                            for (f = 0; f < e.length; f++) {
                                if (e[f].indexOf("a.") === 0) {
                                    u.data["a"][e[f].substring(2)] = b[d];
                                } else if (e[f].indexOf("set.") === 0) {
                                    u.data.set[e[f].substring(4)] = b[d];
                                } else {
                                    u.data[e[f]] = b[d];
                                }
                            }
                        } else {
                            h = d.split(":");
                            if (h.length === 2 && b[h[0]] === h[1]) {
                                if (u.map[d]) {
                                    u.data.enh_action = u.map[d];
                                }
                            }
                        }
                    }
                    if (u.typeOf(u.data.ga_events) === "array" && u.typeOf(b.ga_events) === "array") {
                        if (u.data.ga_events.length === 0 && b.ga_events.length > 0) {
                            u.data.ga_events = b.ga_events;
                        } else if (u.data.ga_events.length > 0 && b.ga_events.length > 0) {
                            u.data.ga_events = u.data.ga_events.concat(b.ga_events);
                        }
                    }
                    u.data.order_id = u.data.order_id || b._corder || "";
                    u.data.order_total = u.data.order_total || b._ctotal || "";
                    u.data.order_shipping = u.data.order_shipping || b._cship || "";
                    u.data.order_tax = u.data.order_tax || b._ctax || "";
                    u.data.order_store = u.data.order_store || b._cstore || "";
                    u.data.order_currency = u.data.order_currency || b._ccurrency || "";
                    u.data.order_coupon_code = u.data.order_coupon_code || b._cpromo || "";
                    if (u.data.product_id.length === 0 && b._cprod !== undefined) {
                        u.data.product_id = b._cprod.slice(0);
                    }
                    if (u.data.product_name.length === 0 && b._cprodname !== undefined) {
                        u.data.product_name = b._cprodname.slice(0);
                    }
                    if (u.data.product_brand.length === 0 && b._cbrand !== undefined) {
                        u.data.product_brand = b._cbrand.slice(0);
                    }
                    if (u.data.product_category.length === 0 && b._ccat !== undefined) {
                        u.data.product_category = b._ccat.slice(0);
                    }
                    if (u.data.product_quantity.length === 0 && b._cquan !== undefined) {
                        u.data.product_quantity = b._cquan.slice(0);
                    }
                    if (u.data.product_unit_price.length === 0 && b._cprice !== undefined) {
                        u.data.product_unit_price = b._cprice.slice(0);
                    }
                    if (u.data.product_discount.length === 0 && b._cpdisc !== undefined) {
                        u.data.product_discount = b._cpdisc.slice(0);
                    }
                    if (u.data.init_before_extensions !== "true") {
                        u.createTracker();
                        u.initTracker();
                    }
                    if (u.data.enhancedecommerce === "true" && !u.required["ec"]) {
                        u.required["ec"] = !0;
                        u.all("require", "ec");
                    }
                    u.data.app_id = u.data.app_id || u.data.appId || b.app_id;
                    u.data.app_name = u.data.app_name || u.data.appName || b.app_name;
                    u.data.app_version = u.data.app_version || u.data.appVersion || b.app_version;
                    u.data.app_rdns = u.data.app_rdns || u.data.appInstallerId || b.app_rdns;
                    u.data.screen_title = u.data.screen_title || u.data.screenName || b.screen_title;
                    if (u.data.app_id || u.data.app_name) {
                        g = {};
                        g.appName = u.data.app_name;
                        g.appId = u.data.app_id || "";
                        g.appVersion = u.data.app_version;
                        g.appInstallerId = u.data.app_rdns;
                        u.all("set", g);
                    }
                    u.data.exception_reason = u.data.exception_reason || b.exception_reason;
                    if (u.data.exception_reason) {
                        g = {};
                        g.exDescription = u.data.exception_reason;
                        g.exFatal = true;
                        u.all("send", "exception", g);
                    }
                    if (u.data.allowLinker === "true" || u.data.allowLinker === true) {
                        if (!u.required["linker"]) {
                            u.all("require", "linker");
                            u.required["linker"] = !0;
                        }
                        if (u.data.crossDomainTrack) {
                            if (u.typeOf(u.data.crossDomainTrack) === "string") {
                                u.data.crossDomainTrack = u.data.crossDomainTrack.replace(/\s/g, '').split(',');
                            }
                            u.all("linker:autoLink", u.data.crossDomainTrack);
                        }
                    }
                    if (u.data.anonymizeIp === "true" || u.data.anonymizeIp === true) {
                        u.all("set", 'anonymizeIp', true);
                    }
                    if (u.data.uid) {
                        u.all("set", "&uid", u.data.uid);
                    }
                    if (u.data.page) {
                        u.all("set", "page", u.data.page);
                    }
                    if (u.data.title) {
                        u.all("set", "title", u.data.title);
                    }
                    if (u.data.location) {
                        u.all("set", "location", u.data.location);
                    }
                    if (u.data.campaignName) {
                        u.all("set", "campaignName", u.data.campaignName);
                    }
                    if (u.data.campaignSource) {
                        u.all("set", "campaignSource", u.data.campaignSource);
                    }
                    if (u.data.campaignMedium) {
                        u.all("set", "campaignMedium", u.data.campaignMedium);
                    }
                    if (u.data.campaignContent) {
                        u.all("set", "campaignContent", u.data.campaignContent);
                    }
                    if (u.data.campaignKeyword) {
                        u.all("set", "campaignKeyword", u.data.campaignKeyword);
                    }
                    if (u.data.displayfeatures === "true" || u.data.displayfeatures === true) {
                        if (!u.required["displayfeatures"]) {
                            u.required["displayfeatures"] = !0;
                            u.all("require", "displayfeatures");
                        }
                    }
                    if (u.data.dataSource) {
                        u.all("set", "dataSource", u.data.dataSource);
                    }
                    for (prop in utag.loader.GV(u.data.set)) {
                        u.all("set", prop, u.data.set[prop]);
                    }
                    u.data.transaction_events = {};
                    u.data.pageview_events = {};
                    u.data.link_events = {};
                    u.data.enhecom_events = {};
                    for (d in utag.loader.GV(u.data)) {
                        if (d.indexOf("-") > -1 && (d.indexOf("metric") > -1 || d.indexOf("dimension") > -1 || d.indexOf("contentGroup") > -1)) {
                            if (d.indexOf("transaction-") === 0) {
                                u.data.transaction_events[d] = u.data[d];
                            } else if (d.indexOf("pageview-") === 0) {
                                u.data.pageview_events[d] = u.data[d];
                            } else if (d.indexOf("link-") === 0) {
                                u.data.link_events[d] = u.data[d];
                            } else if (u.data.enhancedecommerce === "true" && d.indexOf("enh_") === 0) {
                                u.data.enhecom_events[d] = u.data[d];
                            }
                        } else if (d.indexOf("metric") === 0 || d.indexOf("dimension") === 0 || d.indexOf("contentGroup") === 0) {
                            u.all("set", d, u.data[d]);
                        }
                    }
                    if (u.data.enhancedLinkAttribution === "true") {
                        if (!u.required["enhancedLinkAttribution"]) {
                            u.required["enhancedLinkAttribution"] = !0;
                            u.all("require", "linkid", "linkid.js");
                        }
                    }
                    u.data.order_id = (u.data.order_id ? u.data.order_id : u.data.id);
                    if (u.data.enhancedecommerce === "true") {
                        u.all("set", '&cu', (u.data.currency ? u.data.currency : u.data.order_currency));
                        if (u.data.order_id && u.data.enh_action === "refund") {
                            if (u.data.order_id instanceof Array && u.data.order_id.length > 0) {
                                u.data.order_id = u.data.order_id[0];
                            }
                            for (f = 0; f < u.data.product_id.length; f++) {
                                g = {};
                                g.id = u.data.product_id[f];
                                g.quantity = (u.data.product_quantity[f] ? u.data.product_quantity[f] : "1");
                                u.setHitData(g, "enhecom_events", "product_refund", f);
                                u.all('ec:addProduct', g);
                            }
                            g = {};
                            g.id = u.data.order_id;
                            u.setHitData(g, "enhecom_events", "refund");
                            u.all('ec:setAction', 'refund', g);
                        } else if (u.data.order_id) {
                            if (u.data.order_id instanceof Array && u.data.order_id.length > 0) {
                                u.data.order_id = u.data.order_id[0];
                            }
                            u.addproduct("product_purchase", u.data.product_id.length, false);
                            g = {};
                            g.id = u.data.order_id;
                            g.affiliation = (u.data.affiliation ? u.data.affiliation : u.data.order_store);
                            g.revenue = (u.data.revenue ? u.data.revenue : u.data.order_total);
                            g.shipping = (u.data.shipping ? u.data.shipping : u.data.order_shipping);
                            g.tax = (u.data.tax ? u.data.tax : u.data.order_tax);
                            g.coupon = (u.data.coupon ? u.data.coupon : u.data.order_coupon_code);
                            u.setHitData(g, "enhecom_events", "purchase");
                            u.all('ec:setAction', 'purchase', g);
                        } else if (u.data.enh_action === "product_click" && u.data.a === "link") {
                            u.addproduct("product_click", 1, false);
                            u.all('ec:setAction', 'click', {
                                list: u.data.product_action_list
                            });
                            if (u.data.autosend_events === "true") {
                                u.all('send', 'event', 'UX', 'click', 'Results', {
                                    'hitCallback': window[u.data.enh_event_cb]
                                });
                            }
                        } else if (u.data.enh_action === "detail") {
                            u.addproduct("detail", 1, false);
                            g = {};
                            u.setHitData(g, "list", u.data.product_action_list);
                            u.all("ec:setAction", "detail");
                        } else if (u.data.enh_action === "add") {
                            u.addproduct("product_add", u.data.product_id.length, false);
                            u.all('ec:setAction', 'add', {
                                list: u.data.product_action_list
                            });
                            if (u.data.a === "link" && u.data.autosend_events === "true") {
                                u.all('send', 'event', 'UX', 'click', 'add to cart');
                            }
                        } else if (u.data.enh_action === "remove") {
                            u.addproduct("product_remove", u.data.product_id.length, false);
                            u.all('ec:setAction', 'remove');
                            if (u.data.a === "link" && u.data.autosend_events === "true") {
                                u.all('send', 'event', 'UX', 'click', 'remove from cart');
                            }
                        } else if (u.data.enh_action === "checkout") {
                            u.addproduct("product_checkout", u.data.product_id.length, false);
                            g = {};
                            g.step = u.data.enh_checkout_step || "1";
                            g.option = u.data.enh_checkout_option;
                            u.all('ec:setAction', u.data.enh_action, g);
                        }
                        if (u.data.enh_action === "checkout_option" && u.data.a === "link") {
                            g = {};
                            g.step = u.data.enh_checkout_step || "1";
                            g.option = u.data.enh_checkout_option;
                            u.all('ec:setAction', u.data.enh_action, g);
                            if (u.data.autosend_events === "true") {
                                u.all('send', 'event', 'Checkout', 'Option', {
                                    'hitCallback': window[u.data.enh_event_cb]
                                });
                            }
                        }
                        if (u.data.enh_impression_id) {
                            u.addproduct("product_impression", u.data.enh_impression_id.length, true);
                        }
                        if (u.data.enh_promo_id) {
                            u.addpromo(u.data.enh_action, u.data.a);
                        }
                        g = {};
                        if (u.data.order_id) {
                            u.setHitData(g, "transaction_events");
                        }
                        u.setHitData(g, "pageview_events");
                        if (u.data.sessionControl === "start" || u.data.sessionControl === "end") {
                            g.sessionControl = u.data.sessionControl;
                        }
                        if (u.data.a === "view") {
                            if (u.data.screenView === "true" || u.data.screenView === true) {
                                g.screenName = u.data.screen_title || "";
                                u.all("send", "screenview", g);
                            } else {
                                g.hitType = "pageview";
                                u.all("send", g);
                            }
                        }
                    } else if (u.data.a === "view") {
                        g = {};
                        u.setHitData(g, "pageview_events");
                        if (u.data.sessionControl === "start" || u.data.sessionControl === "end") {
                            g.sessionControl = u.data.sessionControl;
                        }
                        if (u.data.screenView === "true" || u.data.screenView === true) {
                            g.screenName = u.data.screen_title || "";
                            u.all("send", "screenview", g);
                        } else {
                            g.hitType = "pageview";
                            u.all("send", g);
                        }
                        if (u.data.order_id && !(u.data.order_id instanceof Array)) {
                            if (!u.required["ecommerce"]) {
                                u.required["ecommerce"] = !0;
                                u.all("require", "ecommerce", "ecommerce.js");
                            }
                            g = {};
                            u.setHitData(g, "transaction_events");
                            g.id = u.data.order_id;
                            g.affiliation = (u.data.affiliation ? u.data.affiliation : u.data.order_store);
                            g.revenue = (u.data.revenue ? u.data.revenue : u.data.order_total);
                            g.shipping = (u.data.shipping ? u.data.shipping : u.data.order_shipping);
                            g.tax = (u.data.tax ? u.data.tax : u.data.order_tax);
                            g.currency = (u.data.currency ? u.data.currency : u.data.order_currency);
                            u.all('ecommerce:addTransaction', g);
                            for (f = 0; f < u.data.product_id.length; f++) {
                                g = {};
                                g.id = u.data.order_id;
                                g.sku = u.data.product_id[f];
                                g.name = (u.data.product_name[f] ? u.data.product_name[f] : u.data.product_id[f]);
                                g.category = (u.data.product_category[f] ? u.data.product_category[f] : "");
                                g.price = (u.data.product_unit_price[f] ? u.data.product_unit_price[f] : "1.00");
                                g.quantity = (u.data.product_quantity[f] ? u.data.product_quantity[f] : "1");
                                u.setHitData(g, "transaction_events");
                                u.all('ecommerce:addItem', g);
                            }
                            u.all('ecommerce:send');
                        } else if (u.data.order_id instanceof Array && u.data.order_id.length > 0) {
                            if (!u.required["ecommerce"]) {
                                u.required["ecommerce"] = !0;
                                u.all("require", "ecommerce", "ecommerce.js");
                            }
                            var lastindex = 0;
                            for (f = 0; f < u.data.order_id.length; f++) {
                                if (f === u.data.order_id.length - 1 || (u.data.order_id[f] !== u.data.order_id[f + 1])) {
                                    g = {};
                                    u.setHitData(g, "transaction_events");
                                    g.id = u.data.order_id[f];
                                    g.affiliation = (u.data.affiliation && typeof u.data.affiliation[f] !== "undefined" ? u.data.affiliation[f] : u.data.order_store);
                                    g.revenue = (u.data.revenue && typeof u.data.revenue[f] !== "undefined" ? u.data.revenue[f] : u.data.order_total);
                                    g.shipping = (u.data.shipping && typeof u.data.shipping[f] !== "undefined" ? u.data.shipping[f] : u.data.order_shipping);
                                    g.tax = (u.data.tax && typeof u.data.tax[f] !== "undefined" ? u.data.tax[f] : u.data.order_tax);
                                    g.currency = (u.data.currency ? u.data.currency : u.data.order_currency);
                                    u.all('ecommerce:addTransaction', g);
                                    for (e = lastindex; e < f + 1; e++) {
                                        g = {};
                                        g.id = u.data.order_id[f];
                                        g.sku = u.data.product_id[e];
                                        g.name = (u.data.product_name[e] ? u.data.product_name[e] : u.data.product_id[e]);
                                        g.category = (u.data.product_category[e] ? u.data.product_category[e] : "");
                                        g.price = (u.data.product_unit_price[e] ? u.data.product_unit_price[e] : "1.00");
                                        g.quantity = (u.data.product_quantity[e] ? u.data.product_quantity[e] : "1");
                                        u.setHitData(g, "transaction_events");
                                        u.all('ecommerce:addItem', g);
                                    }
                                    lastindex = f + 1;
                                }
                            }
                            u.all('ecommerce:send');
                        }
                    }
                    if (u.data.eventCategory && u.data.eventAction) {
                        g = {};
                        u.setHitData(g, "link_events");
                        g.hitType = "event";
                        g.eventCategory = u.data.eventCategory;
                        if (u.data.nonInteraction) {
                            g.nonInteraction = 1;
                        }
                        g.eventAction = u.data.eventAction;
                        if (u.data.eventLabel) {
                            g.eventLabel = u.data.eventLabel;
                        }
                        if (typeof u.data.eventValue !== "undefined" && u.data.eventValue !== "") {
                            g.eventValue = u.data.eventValue;
                        }
                        if (u.data.screenView === "true" || u.data.screenView === true) {
                            g.screenName = u.data.screen_title || "";
                        }
                        if (u.data.sessionControl === "start" || u.data.sessionControl === "end") {
                            g.sessionControl = u.data.sessionControl;
                        }
                        u.all("send", g);
                        u.data.eventCategory = u.data.eventAction = u.data.eventLabel = u.data.eventValue = "";
                    }
                    for (e = 0; e < u.data.ga_events.length; e++) {
                        g = {};
                        u.setHitData(g, "link_events");
                        g.hitType = "event";
                        g.eventCategory = u.data.ga_events[e].eventCategory;
                        g.eventAction = u.data.ga_events[e].eventAction;
                        g.eventLabel = u.data.ga_events[e].eventLabel;
                        g.eventValue = u.data.ga_events[e].eventValue;
                        if (u.data.ga_events[e].nonInteraction) {
                            g.nonInteraction = 1;
                        }
                        if (u.data.sessionControl === "start" || u.data.sessionControl === "end") {
                            g.sessionControl = u.data.sessionControl;
                        }
                        u.all("send", g);
                    }
                    if (u.data.socialNetwork && u.data.socialAction && u.data.socialTarget) {
                        g = {};
                        g.hitType = "social";
                        g.socialNetwork = u.data.socialNetwork;
                        g.socialAction = u.data.socialAction;
                        g.socialTarget = u.data.socialTarget;
                        u.all("send", g);
                        u.data.socialNetwork = u.data.socialAction = u.data.socialTarget = "";
                    }
                    if (u.data.timingCategory && u.data.timingVar && u.data.timingValue) {
                        g = {};
                        g.hitType = "timing";
                        g.timingCategory = u.data.timingCategory;
                        g.timingVar = u.data.timingVar;
                        g.timingValue = u.data.timingValue;
                        g.timingLabel = u.data.timingLabel || "";
                        u.all("send", g);
                    }
                    if (u.data["ga-disable"]) {
                        window["ga-disable-" + u.data["ga-disable"]] = true;
                    }
                    (function() {
                        var id = 'tealium-tag-7110';
                        if (document.getElementById(id)) {
                            return;
                        }
                        u.loader({
                            "type": "script",
                            "src": 'https://www.google-analytics.com/analytics.js',
                            "loc": "script",
                            "id": id
                        });
                        u.o.l = 1 * new Date();
                    })();
                }
            },
            "data": {
                "qsp_delim": "&",
                "kvp_delim": "=",
                "base_url": "",
                "a": "view",
                "cookieDomain": "tagthis.co",
                "name": ["tealium_0"],
                "account": ["UA-12345678-1"],
                "anonymizeIp": "false",
                "allowLinker": "false",
                "crossDomainTrack": "",
                "enhancedLinkAttribution": "false",
                "enhancedecommerce": "false",
                "displayfeatures": "false",
                "screenView": "false",
                "optimizely": "false",
                "init_before_extensions": "false",
                "autofill_params": "false",
                "autosend_events": "true",
                "enh_action": "",
                "enh_event_cb": "",
                "enh_checkout_step": "",
                "enh_checkout_option": "",
                "product_action_list": "",
                "product_variant": [],
                "enh_impression_id": [],
                "enh_impression_name": [],
                "enh_impression_price": [],
                "enh_impression_category": [],
                "enh_impression_brand": [],
                "enh_impression_variant": [],
                "enh_impression_list": [],
                "enh_impression_position": [],
                "enh_promo_id": [],
                "enh_promo_name": [],
                "enh_promo_creative": [],
                "enh_promo_position": [],
                "id": "",
                "product_id": ["ks-01"],
                "product_name": ["Kelly Slater Doing What He Does"],
                "product_brand": [],
                "product_category": ["Lowers"],
                "product_quantity": [],
                "product_unit_price": ["34.99"],
                "product_discount": [],
                "product_position": [],
                "ga_events": [],
                "sessionControl": "",
                "set": {},
                "title": "SwellPrints - Kelly Slater",
                "link-dimension10": "SwellPrints - Kelly Slater",
                "order_id": "",
                "order_total": "",
                "order_shipping": "",
                "order_tax": "",
                "order_store": "",
                "order_currency": "USD",
                "order_coupon_code": "",
                "app_id": undefined,
                "app_name": undefined,
                "app_version": undefined,
                "app_rdns": undefined,
                "screen_title": undefined,
                "exception_reason": undefined,
                "transaction_events": {},
                "pageview_events": {},
                "link_events": {
                    "link-dimension10": "SwellPrints - Kelly Slater"
                },
                "enhecom_events": {}
            }
        },
        "3": {
            "loader": function(o, a, b, c, l, m) {
                utag.DB(o);
                a = document;
                if (o.type == "iframe") {
                    m = a.getElementById(o.id);
                    if (m && m.tagName == "IFRAME") {
                        b = m;
                    } else {
                        b = a.createElement("iframe");
                    }
                    o.attrs = o.attrs || {};
                    utag.ut.merge(o.attrs, {
                        "height": "1",
                        "width": "1",
                        "style": "display:none"
                    }, 0);
                } else if (o.type == "img") {
                    utag.DB("Attach img: " + o.src);
                    b = new Image();
                } else {
                    b = a.createElement("script");
                    b.language = "javascript";
                    b.type = "text/javascript";
                    b.async = 1;
                    b.charset = "utf-8";
                }
                if (o.id) {
                    b.id = o.id
                };
                for (l in utag.loader.GV(o.attrs)) {
                    b.setAttribute(l, o.attrs[l])
                }
                b.setAttribute("src", o.src);
                if (typeof o.cb == "function") {
                    if (b.addEventListener) {
                        b.addEventListener("load", function() {
                            o.cb()
                        }, false);
                    } else {
                        b.onreadystatechange = function() {
                            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                                this.onreadystatechange = null;
                                o.cb()
                            }
                        };
                    }
                }
                if (o.type != "img" && !m) {
                    l = o.loc || "head";
                    c = a.getElementsByTagName(l)[0];
                    if (c) {
                        utag.DB("Attach to " + l + ": " + o.src);
                        if (l == "script") {
                            c.parentNode.insertBefore(b, c);
                        } else {
                            c.appendChild(b)
                        }
                    }
                }
            },
            "ev": {
                "view": 1
            },
            "map": {
                "dblclk_category": "cat"
            },
            "extend": [],
            "send": function(a, b) {
                if (u.ev[a] || u.ev.all !== undefined) {
                    var c, d, e, f, g;
                    u.data = {
                        "qsp_delim": ";",
                        "kvp_delim": "=",
                        "base_url": "",
                        "src": "1234567",
                        "type": "tealcom",
                        "cat": "",
                        "multicat": "",
                        "ord": "",
                        "cost": "",
                        "qty": 0,
                        "total_qty": 0,
                        "countertype": "standard",
                        "conversioncount": "single",
                        "order_id": "",
                        "order_subtotal": "",
                        "product_id": [],
                        "product_quantity": [],
                        "product_unit_price": []
                    };
                    c = [];
                    g = [];
                    for (d in utag.loader.GV(u.map)) {
                        if (b[d] !== undefined && b[d] !== "") {
                            e = u.map[d].split(",");
                            for (f = 0; f < e.length; f++) {
                                if (/^(cat|multicat|type|src|cost|qty|countertype|conversioncount|ord|order_id|order_subtotal|product_id|product_quantity|product_unit_price)$/.test(e[f])) {
                                    u.data[e[f]] = b[d];
                                } else {
                                    u.data[e[f]] = b[d];
                                    g.push(e[f] + u.data.kvp_delim + encodeURIComponent(b[d]))
                                }
                            }
                        }
                    }
                    u.data.order_id = u.data.order_id || u.data.ord || b._corder || "";
                    u.data.order_subtotal = u.data.cost || u.data.order_subtotal || b._csubtotal || b._ctotal || "";
                    if (u.data.product_id.length === 0 && b._cprod !== undefined) {
                        u.data.product_id = b._cprod.slice(0);
                    }
                    if ((u.data.qty && u.data.qty.length > 0) || (u.data.product_quantity.length === 0 && b._cquan !== undefined)) {
                        u.data.product_quantity = u.data.qty || b._cquan.slice(0);
                    }
                    if (u.data.product_unit_price.length === 0 && b._cprice !== undefined) {
                        u.data.product_unit_price = b._cprice.slice(0);
                    }
                    u.data.base_url = '//' + u.data.src + '.fls.doubleclick.net/activityi;src=' + u.data.src + ';type=' + u.data.type + ';';
                    if (u.data.multicat === "") {
                        u.data.multicat_arr = [u.data.cat];
                    } else {
                        u.data.multicat_arr = u.data.multicat.split(';');
                    }
                    if (u.data.order_id) {
                        if (u.data.conversioncount === "multi" && u.data.product_quantity.length > 0) {
                            for (f = 0; f < u.data.product_quantity.length; f++) {
                                u.data.total_qty += parseInt(u.data.product_quantity[f]);
                            }
                            u.data.qty = u.data.total_qty;
                        } else {
                            u.data.qty = 1;
                        }
                        var dc_fl_prd = [];
                        for (var i = 0; i < u.data.product_id.length; i++) {
                            var prod_num = i + 1;
                            dc_fl_prd.push("i" + prod_num + ":" + u.data.product_id[i] + "|p" + prod_num + ":" + u.data.product_unit_price[i] + "|q" + prod_num + ":" + u.data.product_quantity[i])
                        }
                        u.prd = dc_fl_prd.join('|');
                        if (u.prd) {
                            c.push("prd=" + u.prd);
                        }
                        c.push('qty=' + (u.data.qty));
                        c.push('cost=' + (u.data.order_subtotal));
                        if (g.length > 0) {
                            c.push(g.join(';'));
                        }
                        c.push('ord=' + (u.data.order_id));
                    } else if (u.data.countertype === 'standard') {
                        if (g.length > 0) {
                            c.push(g.join(';'));
                        }
                        c.push('ord=' + (Math.random() * 10000000000000));
                    } else if (u.data.countertype === 'unique') {
                        if (g.length > 0) {
                            c.push(g.join(';'));
                        }
                        c.push('ord=1');
                        c.push('num=' + (Math.random() * 10000000000000));
                    } else {
                        if (g.length > 0) {
                            c.push(g.join(';'));
                        }
                        c.push('ord=' + (u.data.order_id ? u.data.order_id : window.utag.data['cp.utag_main_ses_id']));
                    }
                    for (f = 0; f < u.data.multicat_arr.length; f++) {
                        u.loader({
                            "type": "iframe",
                            "src": u.data.base_url + 'cat=' + u.data.multicat_arr[f] + ((c.length > 0) ? ';' + c.join(u.data.qsp_delim) : '') + '?',
                            "loc": "body",
                            "id": 'utag_3_iframe'
                        });
                    }
                }
            },
            "data": {
                "qsp_delim": ";",
                "kvp_delim": "=",
                "base_url": "//1234567.fls.doubleclick.net/activityi;src=1234567;type=tealcom;",
                "src": "1234567",
                "type": "tealcom",
                "cat": "tealkelly",
                "multicat": "",
                "ord": "",
                "cost": "",
                "qty": 0,
                "total_qty": 0,
                "countertype": "standard",
                "conversioncount": "single",
                "order_id": "",
                "order_subtotal": "",
                "product_id": ["ks-01"],
                "product_quantity": [],
                "product_unit_price": ["34.99"],
                "multicat_arr": ["tealkelly"]
            }
        }
    },
    "send": {
        "1": {
            "load": 1,
            "send": 1,
            "v": 201609091909,
            "wait": 1,
            "tid": 20064,
            "id": "1",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.1.js?utv=ut4.42.201609091909"
        },
        "2": {
            "load": 1,
            "send": 1,
            "v": 201609131614,
            "wait": 1,
            "tid": 7110,
            "id": "2",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.2.js?utv=ut4.42.201609131614"
        },
        "3": {
            "load": 1,
            "send": 1,
            "v": 201609131614,
            "wait": 1,
            "tid": 4001,
            "id": "3",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.3.js?utv=ut4.42.201609131614"
        }
    },
    "rpt": {
        "ts": {
            "a": "2016-09-13T22:24:46.168Z",
            "i": "2016-09-13T22:30:53.403Z",
            "s": "2016-09-13T22:30:53.500Z"
        },
        "ex_0": 0,
        "ex_1": 0,
        "ex_2": 0,
        "r_3": "f",
        "r_4": "t",
        "l_1": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.1.js?utv=ut4.42.201609091909",
        "l_2": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.2.js?utv=ut4.42.201609131614",
        "l_3": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.3.js?utv=ut4.42.201609131614",
        "s_1": 0,
        "s_3": 0,
        "s_2": 0,
        "r_0": "t"
    },
    "dbi": [],
    "db_log": [],
    "loader": {
        "q": [],
        "lc": 0,
        "f": {
            "1": 1,
            "2": 1,
            "3": 1,
            "5": 1
        },
        "p": 0,
        "ol": 1,
        "wq": [{
            "load": 1,
            "send": 1,
            "v": 201609091909,
            "wait": 1,
            "tid": 20064,
            "id": "1",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.1.js?utv=ut4.42.201609091909"
        }, {
            "load": 1,
            "send": 1,
            "v": 201609131614,
            "wait": 1,
            "tid": 7110,
            "id": "2",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.2.js?utv=ut4.42.201609131614"
        }, {
            "load": 1,
            "send": 1,
            "v": 201609131614,
            "wait": 1,
            "tid": 4001,
            "id": "3",
            "src": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/utag.3.js?utv=ut4.42.201609131614"
        }, {
            "load": 0,
            "send": 1,
            "v": 201609132100,
            "wait": 1,
            "tid": 7117,
            "id": "5"
        }],
        "lq": [],
        "bq": {},
        "bk": {},
        "rf": 1,
        "ri": 0,
        "rp": 0,
        "rq": [],
        "ready_q": [function(a) {
            if (utag.loader.efr != 1) {
                utag.loader.efr = 1;
                try {
                    if (1) {
                        if (typeof utag.runonce == 'undefined') utag.runonce = {};
                        utag.jdh = function(h, i, j, k) {
                            h = utag.jdhc.length;
                            if (h == 0) window.clearInterval(utag.jdhi);
                            else {
                                for (i = 0; i < h; i++) {
                                    j = utag.jdhc[i];
                                    k = jQuery(j.i).is(":visible") ? 1 : 0;
                                    if (k != j.s) {
                                        if (j.e == (j.s = k)) jQuery(j.i).trigger(j.e ? "afterShow" : "afterHide")
                                    }
                                }
                            }
                        };
                        utag.jdhi = window.setInterval(utag.jdh, 250);
                        utag.jdhc = [];
                        if (typeof utag.runonce[3] == 'undefined') {
                            utag.runonce[3] = 1;
                            jQuery(document.body).on('mousedown', '.carousel-control', function(e) {
                                utag.link({
                                    "event_name": 'Navigation',
                                    "event_category": 'Carousel',
                                    "event_attr_1": jQuery(this).data('slide')
                                })
                            });
                        }
                    }
                } catch (e) {
                    utag.DB(e)
                };
            }
        }, function(a) {
            if (utag.loader.rf == 0) {
                utag.DB('READY:utag.loader.wq');
                utag.loader.rf = 1;
                utag.loader.WQ();
            }
        }],
        "sendq": {
            "pending": 0
        },
        "run_ready_q": function() {
            for (var i = 0; i < utag.loader.ready_q.length; i++) {
                utag.DB("READY_Q:" + i);
                try {
                    utag.loader.ready_q[i]()
                } catch (e) {
                    utag.DB(e)
                };
            }
        },
        "lh": function(a, b, c) {
            a = "" + location.hostname;
            b = a.split(".");
            c = (/\.co\.|\.com\.|\.org\.|\.edu\.|\.net\.|\.asn\./.test(a)) ? 3 : 2;
            return b.splice(b.length - c, c).join(".");
        },
        "WQ": function(a, b, c, d, g) {
            utag.DB('WQ:' + utag.loader.wq.length);
            try {
                if (utag.udoname && utag.udoname.indexOf(".") < 0) {
                    utag.ut.merge(utag.data, window[utag.udoname], 0);
                }
                if (utag.cfg.load_rules_at_wait) {
                    utag.handler.LR(utag.data);
                }
            } catch (e) {
                utag.DB(e)
            };
            d = 0;
            g = [];
            for (a = 0; a < utag.loader.wq.length; a++) {
                b = utag.loader.wq[a];
                b.load = utag.loader.cfg[b.id].load;
                if (b.load == 4) {
                    this.f[b.id] = 0;
                    utag.loader.LOAD(b.id)
                } else if (b.load > 0) {
                    g.push(b);
                    d++;
                } else {
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
        "AS": function(a, b, c, d) {
            utag.send[a.id] = a;
            if (typeof a.src == 'undefined') {
                a.src = utag.cfg.path + ((typeof a.name != 'undefined') ? a.name : 'ut' + 'ag.' + a.id + '.js')
            }
            a.src += (a.src.indexOf('?') > 0 ? '&' : '?') + 'utv=' + (a.v ? utag.cfg.template + a.v : utag.cfg.v);
            utag.rpt['l_' + a.id] = a.src;
            b = document;
            this.f[a.id] = 0;
            if (a.load == 2) {
                utag.DB("Attach sync: " + a.src);
                a.uid = a.id;
                b.write('<script id="utag_' + a.id + '" src="' + a.src + '"></scr' + 'ipt>')
                if (typeof a.cb != 'undefined') a.cb();
            } else if (a.load == 1 || a.load == 3) {
                if (b.createElement) {
                    c = 'utag_tu-partner-us.apt040_' + a.id;
                    if (!b.getElementById(c)) {
                        d = {
                            src: a.src,
                            id: c,
                            uid: a.id,
                            loc: a.loc
                        }
                        if (a.load == 3) {
                            d.type = "iframe"
                        };
                        if (typeof a.cb != 'undefined') d.cb = a.cb;
                        utag.ut.loader(d);
                    }
                }
            }
        },
        "GV": function(a, b, c) {
            b = {};
            for (c in a) {
                if (a.hasOwnProperty(c) && typeof a[c] != "function") b[c] = a[c];
            }
            return b
        },
        "OU": function(a, b, c, d, f) {
            try {
                if (typeof utag.data['cp.OPTOUTMULTI'] != 'undefined') {
                    c = utag.loader.cfg;
                    a = utag.ut.decode(utag.data['cp.OPTOUTMULTI']).split('|');
                    for (d = 0; d < a.length; d++) {
                        b = a[d].split(':');
                        if (b[1] * 1 !== 0) {
                            if (b[0].indexOf('c') == 0) {
                                for (f in utag.loader.GV(c)) {
                                    if (c[f].tcat == b[0].substring(1)) c[f].load = 0
                                }
                            } else if (b[0] * 1 == 0) {
                                utag.cfg.nocookie = true
                            } else {
                                for (f in utag.loader.GV(c)) {
                                    if (c[f].tid == b[0]) c[f].load = 0
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                utag.DB(e)
            }
        },
        "RDdom": function(o) {
            var d = document || {},
                l = location || {};
            o["dom.referrer"] = d.referrer;
            o["dom.title"] = "" + d.title;
            o["dom.domain"] = "" + l.hostname;
            o["dom.query_string"] = ("" + l.search).substring(1);
            o["dom.hash"] = ("" + l.hash).substring(1);
            o["dom.url"] = "" + d.URL;
            o["dom.pathname"] = "" + l.pathname;
            o["dom.viewport_height"] = window.innerHeight || (d.documentElement ? d.documentElement.clientHeight : 960);
            o["dom.viewport_width"] = window.innerWidth || (d.documentElement ? d.documentElement.clientWidth : 960);
        },
        "RDcp": function(o, b, c, d) {
            b = utag.loader.RC();
            for (d in b) {
                if (d.match(/utag_(.*)/)) {
                    for (c in utag.loader.GV(b[d])) {
                        o["cp.utag_" + RegExp.$1 + "_" + c] = b[d][c];
                    }
                }
            }
            for (c in utag.loader.GV((utag.cl && !utag.cl['_all_']) ? utag.cl : b)) {
                if (c.indexOf("utag_") < 0 && typeof b[c] != "undefined") o["cp." + c] = b[c];
            }
        },
        "RDqp": function(o, a, b, c) {
            a = location.search + (location.hash + '').replace("#", "&");
            if (utag.cfg.lowerqp) {
                a = a.toLowerCase()
            };
            if (a.length > 1) {
                b = a.substring(1).split('&');
                for (a = 0; a < b.length; a++) {
                    c = b[a].split("=");
                    if (c.length > 1) {
                        o["qp." + c[0]] = utag.ut.decode(c[1])
                    }
                }
            }
        },
        "RDmeta": function(o, a, b, h) {
            a = document.getElementsByTagName("meta");
            for (b = 0; b < a.length; b++) {
                try {
                    h = a[b].name || a[b].getAttribute("property") || "";
                } catch (e) {
                    h = "";
                    utag.DB(e)
                };
                if (utag.cfg.lowermeta) {
                    h = h.toLowerCase()
                };
                if (h != "") {
                    o["meta." + h] = a[b].content
                }
            }
        },
        "RDva": function(o) {
            var readAttr = function(o, l) {
                var a = "",
                    b;
                a = localStorage.getItem(l);
                if (!a || a == "{}") return;
                b = utag.ut.flatten({
                    va: JSON.parse(a)
                });
                utag.ut.merge(o, b, 1);
            }
            try {
                readAttr(o, "tealium_va");
                readAttr(o, "tealium_va_" + o["ut.account"] + "_" + o["ut.profile"]);
            } catch (e) {
                utag.DB(e)
            }
        },
        "RDut": function(o, a) {
            var t = {};
            var d = new Date();
            var m = (utag.ut.typeOf(d.toISOString) == "function");
            o["ut.domain"] = utag.cfg.domain;
            o["ut.version"] = utag.cfg.v;
            t["tealium_event"] = o["ut.event"] = a || "view";
            t["tealium_visitor_id"] = o["ut.visitor_id"] = o["cp.utag_main_v_id"];
            t["tealium_session_id"] = o["ut.session_id"] = o["cp.utag_main_ses_id"];
            try {
                t["tealium_datasource"] = "";
                t["tealium_account"] = o["ut.account"] = utag.cfg.utid.split("/")[0];
                t["tealium_profile"] = o["ut.profile"] = utag.cfg.utid.split("/")[1];
                t["tealium_environment"] = o["ut.env"] = utag.cfg.path.split("/")[6];
            } catch (e) {
                utag.DB(e)
            }
            t["tealium_random"] = Math.random().toFixed(16).substring(2);
            t["tealium_library_name"] = "ut" + "ag.js";
            t["tealium_library_version"] = (utag.cfg.template + "0").substring(2);
            t["tealium_timestamp_epoch"] = Math.floor(d.getTime() / 1000);
            t["tealium_timestamp_utc"] = (m ? d.toISOString() : "");
            d.setHours(d.getHours() - (d.getTimezoneOffset() / 60));
            t["tealium_timestamp_local"] = (m ? d.toISOString().replace("Z", "") : "");
            utag.ut.merge(o, t, 0);
        },
        "RDses": function(o, a, c) {
            a = (new Date()).getTime();
            c = (a + parseInt(utag.cfg.session_timeout)) + "";
            if (!o["cp.utag_main_ses_id"]) {
                o["cp.utag_main_ses_id"] = a + "";
                o["cp.utag_main__ss"] = "1";
                o["cp.utag_main__sn"] = (1 + parseInt(o["cp.utag_main__sn"] || 0)) + "";
            } else {
                o["cp.utag_main__ss"] = "0";
            }
            o["cp.utag_main__pn"] = o["cp.utag_main__pn"] || "1";
            o["cp.utag_main__st"] = c;
            utag.loader.SC("utag_main", {
                "_sn": (o["cp.utag_main__sn"] || 1),
                "_ss": o["cp.utag_main__ss"],
                "_st": c,
                "ses_id": (o["cp.utag_main_ses_id"] || a) + ";exp-session",
                "_pn": o["cp.utag_main__pn"] + ";exp-session"
            });
        },
        "RDpv": function(o) {
            if (typeof utag.pagevars == "function") {
                utag.DB("Read page variables");
                utag.pagevars(o);
            }
        },
        "RD": function(o, a) {
            utag.DB("utag.loader.RD");
            utag.DB(o);
            utag.loader.RDcp(o);
            if (!utag.loader.rd_flag) {
                utag.loader.rd_flag = 1;
                o["cp.utag_main_v_id"] = o["cp.utag_main_v_id"] || utag.ut.vi((new Date()).getTime());
                o["cp.utag_main__pn"] = (1 + parseInt(o["cp.utag_main__pn"] || 0)) + "";
                utag.loader.SC("utag_main", {
                    "v_id": o["cp.utag_main_v_id"]
                });
                utag.loader.RDses(o);
            }
            if (a && !utag.cfg.noview) utag.loader.RDses(o);
            utag.loader.RDqp(o);
            utag.loader.RDmeta(o);
            utag.loader.RDdom(o);
            utag.loader.RDut(o, a || "view");
            utag.loader.RDpv(o);
            utag.loader.RDva(o);
        },
        "RC": function(a, x, b, c, d, e, f, g, h, i, j, k, l, m, n, o, v, ck, cv, r, s, t) {
            o = {};
            b = ("" + document.cookie != "") ? (document.cookie).split("; ") : [];
            r = /^(.*?)=(.*)$/;
            s = /^(.*);exp-(.*)$/;
            t = (new Date()).getTime();
            for (c = 0; c < b.length; c++) {
                if (b[c].match(r)) {
                    ck = RegExp.$1;
                    cv = RegExp.$2;
                }
                e = utag.ut.decode(cv);
                if (typeof ck != "undefined") {
                    if (ck.indexOf("ulog") == 0 || ck.indexOf("utag_") == 0) {
                        e = cv.split("$");
                        g = [];
                        j = {};
                        for (f = 0; f < e.length; f++) {
                            try {
                                g = e[f].split(":");
                                if (g.length > 2) {
                                    g[1] = g.slice(1).join(":");
                                }
                                v = "";
                                if (("" + g[1]).indexOf("~") == 0) {
                                    h = g[1].substring(1).split("|");
                                    for (i = 0; i < h.length; i++) h[i] = utag.ut.decode(h[i]);
                                    v = h
                                } else v = utag.ut.decode(g[1]);
                                j[g[0]] = v;
                            } catch (er) {
                                utag.DB(er)
                            };
                        }
                        o[ck] = {};
                        for (f in utag.loader.GV(j)) {
                            if (j[f] instanceof Array) {
                                n = [];
                                for (m = 0; m < j[f].length; m++) {
                                    if (j[f][m].match(s)) {
                                        k = (RegExp.$2 == "session") ? (typeof j._st != "undefined" ? j._st : t - 1) : parseInt(RegExp.$2);
                                        if (k > t) n[m] = (x == 0) ? j[f][m] : RegExp.$1;
                                    }
                                }
                                j[f] = n.join("|");
                            } else {
                                j[f] = "" + j[f];
                                if (j[f].match(s)) {
                                    k = (RegExp.$2 == "session") ? (typeof j._st != "undefined" ? j._st : t - 1) : parseInt(RegExp.$2);
                                    j[f] = (k < t) ? null : (x == 0 ? j[f] : RegExp.$1);
                                }
                            }
                            if (j[f]) o[ck][f] = j[f];
                        }
                    } else if (utag.cl[ck] || utag.cl['_all_']) {
                        o[ck] = e
                    }
                }
            }
            return (a) ? (o[a] ? o[a] : {}) : o;
        },
        "SC": function(a, b, c, d, e, f, g, h, i, j, k, x, v) {
            if (!a) return 0;
            if (a == "utag_main" && utag.cfg.nocookie) return 0;
            v = "";
            var date = new Date();
            var exp = new Date();
            exp.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
            x = exp.toGMTString();
            if (c && c == "da") {
                x = "Thu, 31 Dec 2009 00:00:00 GMT";
            } else if (a.indexOf("utag_") != 0 && a.indexOf("ulog") != 0) {
                if (typeof b != "object") {
                    v = b
                }
            } else {
                d = utag.loader.RC(a, 0);
                for (e in utag.loader.GV(b)) {
                    f = "" + b[e];
                    if (f.match(/^(.*);exp-(\d+)(\w)$/)) {
                        g = date.getTime() + parseInt(RegExp.$2) * ((RegExp.$3 == "h") ? 3600000 : 86400000);
                        if (RegExp.$3 == "u") g = parseInt(RegExp.$2);
                        f = RegExp.$1 + ";exp-" + g;
                    }
                    if (c == "i") {
                        if (d[e] == null) d[e] = f;
                    } else if (c == "d") delete d[e];
                    else if (c == "a") d[e] = (d[e] != null) ? (f - 0) + (d[e] - 0) : f;
                    else if (c == "ap" || c == "au") {
                        if (d[e] == null) d[e] = f;
                        else {
                            if (d[e].indexOf("|") > 0) {
                                d[e] = d[e].split("|")
                            }
                            g = (d[e] instanceof Array) ? d[e] : [d[e]];
                            g.push(f);
                            if (c == "au") {
                                h = {};
                                k = {};
                                for (i = 0; i < g.length; i++) {
                                    if (g[i].match(/^(.*);exp-(.*)$/)) {
                                        j = RegExp.$1;
                                    }
                                    if (typeof k[j] == "undefined") {
                                        k[j] = 1;
                                        h[g[i]] = 1;
                                    }
                                }
                                g = [];
                                for (i in utag.loader.GV(h)) {
                                    g.push(i);
                                }
                            }
                            d[e] = g
                        }
                    } else d[e] = f;
                }
                h = new Array();
                for (g in utag.loader.GV(d)) {
                    if (d[g] instanceof Array) {
                        for (c = 0; c < d[g].length; c++) {
                            d[g][c] = encodeURIComponent(d[g][c])
                        }
                        h.push(g + ":~" + d[g].join("|"))
                    } else h.push((g + ":").replace(/[\,\$\;\?]/g, "") + encodeURIComponent(d[g]))
                }
                if (h.length == 0) {
                    h.push("");
                    x = ""
                }
                v = (h.join("$"));
            }
            document.cookie = a + "=" + v + ";path=/;domain=" + utag.cfg.domain + ";expires=" + x;
            return 1
        },
        "LOAD": function(a, b, c, d) {
            if (!utag.loader.cfg) {
                return
            }
            if (this.ol == 0) {
                if (utag.loader.cfg[a].block && utag.loader.cfg[a].cbf) {
                    this.f[a] = 1;
                    delete utag.loader.bq[a];
                }
                for (b in utag.loader.GV(utag.loader.bq)) {
                    if (utag.loader.cfg[a].load == 4 && utag.loader.cfg[a].wait == 0) {
                        utag.loader.bk[a] = 1;
                        utag.DB("blocked: " + a);
                    }
                    utag.DB("blocking: " + b);
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
                        utag.DB("SENDING: " + a);
                        try {
                            if (utag.loader.sendq.pending > 0 && utag.loader.sendq[a]) {
                                utag.DB("utag.loader.LOAD:sendq: " + a);
                                while (d = utag.loader.sendq[a].shift()) {
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
                    if (this.f[b] == 0 || this.f[b] == 2) return
                }
                utag.loader.END();
            }
        },
        "EV": function(a, b, c, d) {
            if (b == "ready") {
                if (!utag.data) {
                    try {
                        utag.cl = {
                            '_all_': 1
                        };
                        utag.loader.initdata();
                        utag.loader.RD(utag.data);
                    } catch (e) {
                        utag.DB(e)
                    };
                }
                if ((document.attachEvent || utag.cfg.dom_complete) ? document.readyState === "complete" : document.readyState !== "loading") setTimeout(c, 1);
                else {
                    utag.loader.ready_q.push(c);
                    var RH;
                    if (utag.loader.ready_q.length <= 1) {
                        if (document.addEventListener) {
                            RH = function() {
                                document.removeEventListener("DOMContentLoaded", RH, false);
                                utag.loader.run_ready_q()
                            };
                            if (!utag.cfg.dom_complete) document.addEventListener("DOMContentLoaded", RH, false);
                            window.addEventListener("load", utag.loader.run_ready_q, false);
                        } else if (document.attachEvent) {
                            RH = function() {
                                if (document.readyState === "complete") {
                                    document.detachEvent("onreadystatechange", RH);
                                    utag.loader.run_ready_q()
                                }
                            };
                            document.attachEvent("onreadystatechange", RH);
                            window.attachEvent("onload", utag.loader.run_ready_q);
                        }
                    }
                }
            } else {
                if (a.addEventListener) {
                    a.addEventListener(b, c, false)
                } else if (a.attachEvent) {
                    a.attachEvent(((d == 1) ? "" : "on") + b, c)
                }
            }
        },
        "END": function(b, c, d, e, v, w) {
            if (this.ended) {
                return
            };
            this.ended = 1;
            utag.DB("loader.END");
            b = utag.data;
            if (utag.handler.base && utag.handler.base != '*') {
                e = utag.handler.base.split(",");
                for (d = 0; d < e.length; d++) {
                    if (typeof b[e[d]] != "undefined") utag.handler.df[e[d]] = b[e[d]]
                }
            } else if (utag.handler.base == '*') {
                utag.ut.merge(utag.handler.df, b, 1);
            }
            utag.rpt['r_0'] = "t";
            for (var r in utag.loader.GV(utag.cond)) {
                utag.rpt['r_' + r] = (utag.cond[r]) ? "t" : "f";
            }
            utag.rpt.ts['s'] = new Date();
            v = ".tiqcdn.com";
            w = utag.cfg.path.indexOf(v);
            if (w > 0 && b["cp.utag_main__ss"] == 1 && !utag.cfg.no_session_count) utag.ut.loader({
                src: utag.cfg.path.substring(0, w) + v + "/ut" + "ag/tiqapp/ut" + "ag.v.js?a=" + utag.cfg.utid + (utag.cfg.nocookie ? "&nocookie=1" : "&cb=" + (new Date).getTime()),
                id: "tiqapp"
            })
            if (utag.cfg.noview != true) utag.handler.RE('view', b, "end");
            utag.handler.INIT();
        },
        "initdata": function() {
            try {
                utag.data = (typeof utag_data != 'undefined') ? utag_data : {};
                utag.udoname = 'utag_data';
            } catch (e) {
                utag.data = {};
                utag.DB('idf:' + e);
            }
        },
        "loadrules": function(_pd, _pc) {
            var d = _pd || utag.data;
            var c = _pc || utag.cond;
            for (var l in utag.loader.GV(c)) {
                switch (l) {
                    case '3':
                        try {
                            c[3] |= (d['page_type'] == 'order_confirmation_page')
                        } catch (e) {
                            utag.DB(e)
                        };
                        break;
                    case '4':
                        try {
                            c[4] |= (typeof d['cp.utag_main_stored_gclid'] != 'undefined')
                        } catch (e) {
                            utag.DB(e)
                        };
                        break;
                }
            }
        },
        "GET": function() {
            utag.cl = {
                '_all_': 1
            };
            utag.pre();
            utag.handler.extend = [function(a, b, c, d) {
                b._ccity = (typeof b['customer_city'] != 'undefined') ? b['customer_city'] : '';
                b._ccountry = (typeof b['customer_country'] != 'undefined') ? b['customer_country'] : '';
                b._ccurrency = (typeof b['order_currency'] != 'undefined') ? b['order_currency'] : '';
                b._ccustid = (typeof b['customer_email'] != 'undefined') ? b['customer_email'] : '';
                b._corder = (typeof b['order_id'] != 'undefined') ? b['order_id'] : '';
                b._cpromo = '';
                b._cship = (typeof b['order_shipping'] != 'undefined') ? b['order_shipping'] : '';
                b._cstate = (typeof b['customer_state'] != 'undefined') ? b['customer_state'] : '';
                b._cstore = '';
                b._csubtotal = (typeof b['order_subtotal'] != 'undefined') ? b['order_subtotal'] : '';
                b._ctax = (typeof b['order_tax'] != 'undefined') ? b['order_tax'] : '';
                b._ctotal = (typeof b['order_total'] != 'undefined') ? b['order_total'] : '';
                b._ctype = '';
                b._czip = (typeof b['customer_zip'] != 'undefined') ? b['customer_zip'] : '';
                b._cprod = (typeof b['product_id'] != 'undefined' && b['product_id'].length > 0) ? b['product_id'] : [];
                b._cprodname = (typeof b['product_name'] != 'undefined' && b['product_name'].length > 0) ? b['product_name'] : [];
                b._cbrand = (typeof b[''] != 'undefined' && b[''].length > 0) ? b[''] : [];
                b._ccat = (typeof b['product_category'] != 'undefined' && b['product_category'].length > 0) ? b['product_category'] : [];
                b._ccat2 = (typeof b['product_subcategory'] != 'undefined' && b['product_subcategory'].length > 0) ? b['product_subcategory'] : [];
                b._cquan = (typeof b['product_quantity'] != 'undefined' && b['product_quantity'].length > 0) ? b['product_quantity'] : [];
                b._cprice = (typeof b['product_unit_price'] != 'undefined' && b['product_unit_price'].length > 0) ? b['product_unit_price'] : [];
                b._csku = (typeof b['product_sku'] != 'undefined' && b['product_sku'].length > 0) ? b['product_sku'] : [];
                b._cpdisc = [];
                if (b._cprod.length == 0) {
                    b._cprod = b._csku.slice()
                };
                if (b._cprodname.length == 0) {
                    b._cprodname = b._csku.slice()
                };

                function tf(a) {
                    if (a == '' || isNaN(parseFloat(a))) {
                        return a
                    } else {
                        return (parseFloat(a)).toFixed(2)
                    }
                };
                b._ctotal = tf(b._ctotal);
                b._csubtotal = tf(b._csubtotal);
                b._ctax = tf(b._ctax);
                b._cship = tf(b._cship);
                for (c = 0; c < b._cprice.length; c++) {
                    b._cprice[c] = tf(b._cprice[c])
                };
                for (c = 0; c < b._cpdisc.length; c++) {
                    b._cpdisc[c] = tf(b._cpdisc[c])
                };
            }, function(a, b, c, d, e, f, g) {
                d = b['page_name'];
                if (typeof d == 'undefined') return;
                c = [{
                    'Grant Twiggy Baker': 'tealtwig'
                }, {
                    'Dropping In': 'tealair'
                }, {
                    'StillWave': 'tealstill'
                }, {
                    'Kelly Slater': 'tealkelly'
                }, {
                    'Heitor Alves': 'tealheitor'
                }, {
                    'Shacked at Gas Chambers': 'tealshacked'
                }, {
                    'Sunset over Kaena Point': 'tealkaena'
                }, {
                    'Your Cart': 'tealcart'
                }, {
                    'Your Order Confirmation': 'tealconf'
                }];
                var m = false;
                for (e = 0; e < c.length; e++) {
                    for (f in c[e]) {
                        if (d.toString().indexOf(f) > -1) {
                            b['dblclk_category'] = c[e][f];
                            m = true
                        };
                    };
                    if (m) break
                };
                if (!m) b['dblclk_category'] = 'none';
            }, function(a, b) {
                try {
                    if (typeof b['qp.gclid'] != 'undefined') {
                        utag.loader.SC('utag_main', {
                            'stored_gclid': b['qp.gclid'] + ';exp-session'
                        });
                        b['cp.utag_main_stored_gclid'] = b['qp.gclid'];
                    }
                } catch (e) {
                    utag.DB(e)
                }
            }];
            utag.handler.cfg_extend = [{
                "alr": 0,
                "bwq": 0,
                "id": "1",
                "blr": 1,
                "end": 0
            }, {
                "alr": 0,
                "bwq": 0,
                "id": "4",
                "blr": 1,
                "end": 0
            }, {
                "alr": 0,
                "bwq": 0,
                "id": "5",
                "blr": 1,
                "end": 0
            }];
            utag.loader.initcfg = function() {
                utag.loader.cfg = {
                    "1": {
                        load: 1,
                        send: 1,
                        v: 201609091909,
                        wait: 1,
                        tid: 20064
                    },
                    "2": {
                        load: 1,
                        send: 1,
                        v: 201609131614,
                        wait: 1,
                        tid: 7110
                    },
                    "3": {
                        load: 1,
                        send: 1,
                        v: 201609131614,
                        wait: 1,
                        tid: 4001
                    },
                    "5": {
                        load: (utag.cond[3] && utag.cond[4]),
                        send: 1,
                        v: 201609132100,
                        wait: 1,
                        tid: 7117
                    }
                };
                utag.loader.cfgsort = ["1", "2", "3", "5"];
            }
            utag.loader.initcfg();
        },
        "PINIT": function(a, b, c) {
            utag.DB("Pre-INIT");
            if (utag.cfg.noload) {
                return;
            }
            try {
                this.GET();
                if (utag.handler.RE('view', utag.data, "blr")) {
                    utag.handler.LR(utag.data);
                }
            } catch (e) {
                utag.DB(e)
            };
            a = this.cfg;
            c = 0;
            for (b in this.GV(a)) {
                if (a[b].block == 1 || (a[b].load > 0 && (typeof a[b].src != 'undefined' && a[b].src != ''))) {
                    a[b].block = 1;
                    c = 1;
                    this.bq[b] = 1;
                }
            }
            if (c == 1) {
                for (b in this.GV(a)) {
                    if (a[b].block) {
                        a[b].id = b;
                        if (a[b].load == 4) a[b].load = 1;
                        a[b].cb = function() {
                            var d = this.uid;
                            utag.loader.cfg[d].cbf = 1;
                            utag.loader.LOAD(d)
                        };
                        this.AS(a[b]);
                    }
                }
            }
            if (c == 0) this.INIT();
        },
        "INIT": function(a, b, c, d, e) {
            utag.DB('utag.loader.INIT');
            if (this.ol == 1) return -1;
            else this.ol = 1;
            if (utag.cfg.noview != true) utag.handler.RE('view', utag.data, "alr");
            utag.rpt.ts['i'] = new Date();
            d = this.cfgsort;
            for (a = 0; a < d.length; a++) {
                e = d[a];
                b = this.cfg[e];
                b.id = e;
                if (b.block != 1 && b.s2s != 1) {
                    if (utag.loader.bk[b.id] || ((utag.cfg.readywait || utag.cfg.noview) && b.load == 4)) {
                        this.f[b.id] = 0;
                        utag.loader.LOAD(b.id)
                    } else if (b.wait == 1 && utag.loader.rf == 0) {
                        utag.DB('utag.loader.INIT: waiting ' + b.id);
                        this.wq.push(b)
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
            return 1
        },
        "rd_flag": 1,
        "initcfg": function() {
            utag.loader.cfg = {
                "1": {
                    load: 1,
                    send: 1,
                    v: 201609091909,
                    wait: 1,
                    tid: 20064
                },
                "2": {
                    load: 1,
                    send: 1,
                    v: 201609131614,
                    wait: 1,
                    tid: 7110
                },
                "3": {
                    load: 1,
                    send: 1,
                    v: 201609131614,
                    wait: 1,
                    tid: 4001
                },
                "5": {
                    load: (utag.cond[3] && utag.cond[4]),
                    send: 1,
                    v: 201609132100,
                    wait: 1,
                    tid: 7117
                }
            };
            utag.loader.cfgsort = ["1", "2", "3", "5"];
        },
        "cfg": {
            "1": {
                "load": 1,
                "send": 1,
                "v": 201609091909,
                "wait": 1,
                "tid": 20064,
                "executed": 1
            },
            "2": {
                "load": 1,
                "send": 1,
                "v": 201609131614,
                "wait": 1,
                "tid": 7110,
                "executed": 1
            },
            "3": {
                "load": 1,
                "send": 1,
                "v": 201609131614,
                "wait": 1,
                "tid": 4001,
                "executed": 1
            },
            "5": {
                "load": 0,
                "send": 1,
                "v": 201609132100,
                "wait": 1,
                "tid": 7117,
                "executed": 0
            }
        },
        "cfgsort": ["1", "2", "3", "5"],
        "efr": 1,
        "ended": 1
    },
    "DB": function(a, b) {
        if (utag.cfg.utagdb === false) {
            return;
        } else if (typeof utag.cfg.utagdb == "undefined") {
            b = document.cookie + '';
            utag.cfg.utagdb = ((b.indexOf('utagdb=true') >= 0) ? true : false);
        }
        if (utag.cfg.utagdb === true) {
            var t;
            if (utag.ut.typeOf(a) == "object") {
                t = utag.handler.C(a)
            } else {
                t = a
            }
            utag.db_log.push(t);
            try {
                if (!utag.cfg.noconsole) console.log(t)
            } catch (e) {}
        }
    },
    "RP": function(a, b, c) {
        if (typeof a != 'undefined' && typeof a.src != 'undefined' && a.src != '') {
            b = [];
            for (c in utag.loader.GV(a)) {
                if (c != 'src') b.push(c + '=' + escape(a[c]))
            }
            this.dbi.push((new Image()).src = a.src + '?utv=' + utag.cfg.v + '&utid=' + utag.cfg.utid + '&' + (b.join('&')))
        }
    },
    "view": function(a, c, d) {
        return this.track({
            event: 'view',
            data: a,
            cfg: {
                cb: c,
                uids: d
            }
        })
    },
    "link": function(a, c, d) {
        return this.track({
            event: 'link',
            data: a,
            cfg: {
                cb: c,
                uids: d
            }
        })
    },
    "track": function(a, b, c, d) {
        if (typeof a == "string") a = {
            event: a,
            data: b,
            cfg: {
                cb: c
            }
        };
        for (d in utag.loader.GV(utag.o)) {
            try {
                utag.o[d].handler.trigger(a.event || "view", a.data || a, a.cfg)
            } catch (e) {
                utag.DB(e)
            };
        }
        if (a.cfg && a.cfg.cb) try {
            a.cfg.cb()
        } catch (e) {
            utag.DB(e)
        };
        return true
    },
    "handler": {
        "base": "",
        "df": {},
        "o": {},
        "send": {},
        "iflag": 1,
        "INIT": function(a, b, c) {
            utag.DB('utag.handler.INIT');
            if (utag.initcatch) {
                utag.initcatch = 0;
                return
            }
            this.iflag = 1;
            a = utag.loader.q.length;
            if (a > 0) {
                utag.DB("Loader queue");
                for (b = 0; b < a; b++) {
                    c = utag.loader.q[b];
                    utag.handler.trigger(c.a, c.b, c.c)
                }
            }
        },
        "test": function() {
            return 1
        },
        "LR": function(b) {
            utag.DB("Load Rules");
            for (var d in utag.loader.GV(utag.cond)) {
                utag.cond[d] = false;
            }
            utag.DB(b);
            utag.loader.loadrules(b);
            utag.DB(utag.cond);
            utag.loader.initcfg();
            utag.loader.OU();
            for (var r in utag.loader.GV(utag.cond)) {
                utag.rpt['r_' + r] = (utag.cond[r]) ? "t" : "f";
            }
        },
        "RE": function(a, b, c, d, e, f, g) {
            if (c != "alr" && !this.cfg_extend) {
                return 0;
            }
            utag.DB("RE: " + c);
            if (c == "alr") utag.DB("All Tags EXTENSIONS");
            utag.DB(b);
            if (typeof this.extend != "undefined") {
                g = 0;
                for (d = 0; d < this.extend.length; d++) {
                    try {
                        e = 0;
                        if (typeof this.cfg_extend != "undefined") {
                            f = this.cfg_extend[d];
                            if (typeof f.count == "undefined") f.count = 0;
                            if (f[a] == 0 || (f.once == 1 && f.count > 0) || f[c] == 0) {
                                e = 1
                            } else {
                                if (f[c] == 1) {
                                    g = 1
                                };
                                f.count++
                            }
                        }
                        if (e != 1) {
                            this.extend[d](a, b);
                            utag.rpt['ex_' + d] = 0
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
        "trigger": function(a, b, c, d, e, f) {
            utag.DB('trigger:' + a + (c && c.uids ? ":" + c.uids.join(",") : ""));
            b = b || {};
            utag.DB(b);
            if (!this.iflag) {
                utag.DB("trigger:called before tags loaded");
                for (d in utag.loader.f) {
                    if (!(utag.loader.f[d] === 1)) utag.DB('Tag ' + d + ' did not LOAD')
                }
                utag.loader.q.push({
                    a: a,
                    b: utag.handler.C(b),
                    c: c
                });
                return;
            }
            utag.ut.merge(b, this.df, 0);
            utag.loader.RD(b, a);
            utag.cfg.noview = false;

            function sendTag(a, b, d) {
                try {
                    if (typeof utag.sender[d] != "undefined") {
                        utag.DB("SENDING: " + d);
                        utag.sender[d].send(a, utag.handler.C(b));
                        utag.rpt['s_' + d] = 0;
                    } else if (utag.loader.cfg[d].load != 2 && utag.loader.cfg[d].s2s != 1) {
                        utag.loader.sendq[d] = utag.loader.sendq[d] || [];
                        utag.loader.sendq[d].push({
                            "event": a,
                            "data": utag.handler.C(b)
                        });
                        utag.loader.sendq.pending++;
                        utag.loader.AS({
                            id: d,
                            load: 1
                        });
                    }
                } catch (e) {
                    utag.DB(e)
                }
            }
            if (c && c.uids) {
                this.RE(a, b, "alr");
                for (f = 0; f < c.uids.length; f++) {
                    d = c.uids[f];
                    sendTag(a, b, d);
                }
            } else if (utag.cfg.load_rules_ajax) {
                this.RE(a, b, "blr");
                this.LR(b);
                this.RE(a, b, "alr");
                for (f = 0; f < utag.loader.cfgsort.length; f++) {
                    d = utag.loader.cfgsort[f];
                    if (utag.loader.cfg[d].load && utag.loader.cfg[d].send) {
                        sendTag(a, b, d);
                    }
                }
            } else {
                this.RE(a, b, "alr");
                for (d in utag.loader.GV(utag.sender)) {
                    sendTag(a, b, d);
                }
            }
            this.RE(a, b, "end");
        },
        "C": function(a, b, c) {
            b = {};
            for (c in utag.loader.GV(a)) {
                if (a[c] instanceof Array) {
                    b[c] = a[c].slice(0)
                } else {
                    b[c] = a[c]
                }
            }
            return b
        },
        "extend": [function(a, b, c, d) {
            b._ccity = (typeof b['customer_city'] != 'undefined') ? b['customer_city'] : '';
            b._ccountry = (typeof b['customer_country'] != 'undefined') ? b['customer_country'] : '';
            b._ccurrency = (typeof b['order_currency'] != 'undefined') ? b['order_currency'] : '';
            b._ccustid = (typeof b['customer_email'] != 'undefined') ? b['customer_email'] : '';
            b._corder = (typeof b['order_id'] != 'undefined') ? b['order_id'] : '';
            b._cpromo = '';
            b._cship = (typeof b['order_shipping'] != 'undefined') ? b['order_shipping'] : '';
            b._cstate = (typeof b['customer_state'] != 'undefined') ? b['customer_state'] : '';
            b._cstore = '';
            b._csubtotal = (typeof b['order_subtotal'] != 'undefined') ? b['order_subtotal'] : '';
            b._ctax = (typeof b['order_tax'] != 'undefined') ? b['order_tax'] : '';
            b._ctotal = (typeof b['order_total'] != 'undefined') ? b['order_total'] : '';
            b._ctype = '';
            b._czip = (typeof b['customer_zip'] != 'undefined') ? b['customer_zip'] : '';
            b._cprod = (typeof b['product_id'] != 'undefined' && b['product_id'].length > 0) ? b['product_id'] : [];
            b._cprodname = (typeof b['product_name'] != 'undefined' && b['product_name'].length > 0) ? b['product_name'] : [];
            b._cbrand = (typeof b[''] != 'undefined' && b[''].length > 0) ? b[''] : [];
            b._ccat = (typeof b['product_category'] != 'undefined' && b['product_category'].length > 0) ? b['product_category'] : [];
            b._ccat2 = (typeof b['product_subcategory'] != 'undefined' && b['product_subcategory'].length > 0) ? b['product_subcategory'] : [];
            b._cquan = (typeof b['product_quantity'] != 'undefined' && b['product_quantity'].length > 0) ? b['product_quantity'] : [];
            b._cprice = (typeof b['product_unit_price'] != 'undefined' && b['product_unit_price'].length > 0) ? b['product_unit_price'] : [];
            b._csku = (typeof b['product_sku'] != 'undefined' && b['product_sku'].length > 0) ? b['product_sku'] : [];
            b._cpdisc = [];
            if (b._cprod.length == 0) {
                b._cprod = b._csku.slice()
            };
            if (b._cprodname.length == 0) {
                b._cprodname = b._csku.slice()
            };

            function tf(a) {
                if (a == '' || isNaN(parseFloat(a))) {
                    return a
                } else {
                    return (parseFloat(a)).toFixed(2)
                }
            };
            b._ctotal = tf(b._ctotal);
            b._csubtotal = tf(b._csubtotal);
            b._ctax = tf(b._ctax);
            b._cship = tf(b._cship);
            for (c = 0; c < b._cprice.length; c++) {
                b._cprice[c] = tf(b._cprice[c])
            };
            for (c = 0; c < b._cpdisc.length; c++) {
                b._cpdisc[c] = tf(b._cpdisc[c])
            };
        }, function(a, b, c, d, e, f, g) {
            d = b['page_name'];
            if (typeof d == 'undefined') return;
            c = [{
                'Grant Twiggy Baker': 'tealtwig'
            }, {
                'Dropping In': 'tealair'
            }, {
                'StillWave': 'tealstill'
            }, {
                'Kelly Slater': 'tealkelly'
            }, {
                'Heitor Alves': 'tealheitor'
            }, {
                'Shacked at Gas Chambers': 'tealshacked'
            }, {
                'Sunset over Kaena Point': 'tealkaena'
            }, {
                'Your Cart': 'tealcart'
            }, {
                'Your Order Confirmation': 'tealconf'
            }];
            var m = false;
            for (e = 0; e < c.length; e++) {
                for (f in c[e]) {
                    if (d.toString().indexOf(f) > -1) {
                        b['dblclk_category'] = c[e][f];
                        m = true
                    };
                };
                if (m) break
            };
            if (!m) b['dblclk_category'] = 'none';
        }, function(a, b) {
            try {
                if (typeof b['qp.gclid'] != 'undefined') {
                    utag.loader.SC('utag_main', {
                        'stored_gclid': b['qp.gclid'] + ';exp-session'
                    });
                    b['cp.utag_main_stored_gclid'] = b['qp.gclid'];
                }
            } catch (e) {
                utag.DB(e)
            }
        }],
        "cfg_extend": [{
            "alr": 0,
            "bwq": 0,
            "id": "1",
            "blr": 1,
            "end": 0,
            "count": 1
        }, {
            "alr": 0,
            "bwq": 0,
            "id": "4",
            "blr": 1,
            "end": 0,
            "count": 1
        }, {
            "alr": 0,
            "bwq": 0,
            "id": "5",
            "blr": 1,
            "end": 0,
            "count": 1
        }]
    },
    "ut": {
        "pad": function(a, b, c, d) {
            a = "" + ((a - 0).toString(16));
            d = '';
            if (b > a.length) {
                for (c = 0; c < (b - a.length); c++) {
                    d += '0'
                }
            }
            return "" + d + a
        },
        "vi": function(t, a, b) {
            if (!utag.v_id) {
                a = this.pad(t, 12);
                b = "" + Math.random();
                a += this.pad(b.substring(2, b.length), 16);
                try {
                    a += this.pad((navigator.plugins.length ? navigator.plugins.length : 0), 2);
                    a += this.pad(navigator.userAgent.length, 3);
                    a += this.pad(document.URL.length, 4);
                    a += this.pad(navigator.appVersion.length, 3);
                    a += this.pad(screen.width + screen.height + parseInt((screen.colorDepth) ? screen.colorDepth : screen.pixelDepth), 5)
                } catch (e) {
                    utag.DB(e);
                    a += "12345"
                };
                utag.v_id = a;
            }
            return utag.v_id
        },
        "hasOwn": function(o, a) {
            return o != null && Object.prototype.hasOwnProperty.call(o, a)
        },
        "isEmptyObject": function(o, a) {
            for (a in o) {
                if (utag.ut.hasOwn(o, a)) return false
            }
            return true
        },
        "isEmpty": function(o) {
            var t = utag.ut.typeOf(o);
            if (t == "number") {
                return isNaN(o)
            } else if (t == "boolean") {
                return false
            } else if (t == "string") {
                return o.length === 0
            } else return utag.ut.isEmptyObject(o)
        },
        "typeOf": function(e) {
            return ({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },
        "flatten": function(o) {
            var a = {};

            function r(c, p) {
                if (Object(c) !== c || c instanceof Array) {
                    a[p] = c;
                } else {
                    if (utag.ut.isEmptyObject(c)) {} else {
                        for (var d in c) {
                            r(c[d], p ? p + "." + d : d);
                        }
                    }
                }
            }
            r(o, "");
            return a;
        },
        "merge": function(a, b, c, d) {
            if (c) {
                for (d in utag.loader.GV(b)) {
                    a[d] = b[d]
                }
            } else {
                for (d in utag.loader.GV(b)) {
                    if (typeof a[d] == "undefined") a[d] = b[d]
                }
            }
        },
        "decode": function(a, b) {
            b = "";
            try {
                b = decodeURIComponent(a)
            } catch (e) {
                utag.DB(e)
            };
            if (b == "") {
                b = unescape(a)
            };
            return b
        },
        "encode": function(a, b) {
            b = "";
            try {
                b = encodeURIComponent(a)
            } catch (e) {
                utag.DB(e)
            };
            if (b == "") {
                b = escape(a)
            };
            return b
        },
        "error": function(a, b, c) {
            if (typeof utag_err != "undefined") {
                utag_err.push(a)
            }
        },
        "loader": function(o, a, b, c, l, m) {
            utag.DB(o);
            a = document;
            if (o.type == "iframe") {
                m = a.getElementById(o.id);
                if (m && m.tagName == "IFRAME") {
                    b = m;
                } else {
                    b = a.createElement("iframe");
                }
                o.attrs = o.attrs || {};
                utag.ut.merge(o.attrs, {
                    "height": "1",
                    "width": "1",
                    "style": "display:none"
                }, 0);
            } else if (o.type == "img") {
                utag.DB("Attach img: " + o.src);
                b = new Image();
            } else {
                b = a.createElement("script");
                b.language = "javascript";
                b.type = "text/javascript";
                b.async = 1;
                b.charset = "utf-8";
            }
            if (o.id) {
                b.id = o.id
            };
            for (l in utag.loader.GV(o.attrs)) {
                b.setAttribute(l, o.attrs[l])
            }
            b.setAttribute("src", o.src);
            if (typeof o.cb == "function") {
                if (b.addEventListener) {
                    b.addEventListener("load", function() {
                        o.cb()
                    }, false);
                } else {
                    b.onreadystatechange = function() {
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            this.onreadystatechange = null;
                            o.cb()
                        }
                    };
                }
            }
            if (o.type != "img" && !m) {
                l = o.loc || "head";
                c = a.getElementsByTagName(l)[0];
                if (c) {
                    utag.DB("Attach to " + l + ": " + o.src);
                    if (l == "script") {
                        c.parentNode.insertBefore(b, c);
                    } else {
                        c.appendChild(b)
                    }
                }
            }
        },
        "writevamain": function(o) {
            utag.DB("Visitor Attributes: " + prefix + key);
            utag.DB(o)
            var str = JSON.stringify(o);
            if (str != "{}" && str != "") {
                try {
                    localStorage.setItem('tealium_va_update', utag.data["cp.utag_main_dc_visit"]);
                    localStorage.setItem(prefix, str);
                    localStorage.setItem(prefix + key, str);
                } catch (e) {
                    utag.DB(e)
                }
                if (typeof tealium_enrichment == "function") {
                    tealium_enrichment(o, prefix + key);
                }
            }
        }
    },
    "cfg": {
        "template": "ut4.42.",
        "load_rules_ajax": true,
        "load_rules_at_wait": true,
        "lowerqp": false,
        "noconsole": false,
        "session_timeout": 1800000,
        "readywait": 0,
        "noload": 0,
        "domain": "",
        "path": "//tags.tiqcdn.com/tmu/tu-partner-us/apt040/prod/",
        "utid": "tu-partner-us/apt040/201609132206",
        "v": "ut4.42.201609132206",
        "utagdb": false
    },
    "cond": {
        "3": 0,
        "4": 1
    },
    "pre": function() {
        utag.loader.initdata();
        try {
            utag.loader.RD(utag.data)
        } catch (e) {
            utag.DB(e)
        };
        utag.loader.loadrules();
    },
    "cl": {
        "_all_": 1
    },
    "data": {
        "page_name": "SwellPrints - Kelly Slater",
        "page_category": "Products -- Lower Trestles, CA",
        "page_type": "product_detail_page",
        "order_currency": "USD",
        "customer_country": "US",
        "product_name": ["Kelly Slater Doing What He Does"],
        "product_id": ["ks-01"],
        "product_sku": ["lws-ks-01"],
        "product_unit_price": ["34.99"],
        "product_category": ["Lowers"],
        "product_subcategory": ["Kelly Slater"],
        "product_image_url": ["http://assets.tagthis.co/products/thumbnails/kelly_500px.jpg"],
        "product_url": ["http://tagthis.co/buy_kelly.html"],
        "cp.utag_main_v_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "cp.utag_main__sn": "5",
        "cp.utag_main__ss": "0",
        "cp.utag_main__st": "1473807647683",
        "cp.utag_main_dc_visit": "5",
        "cp.utag_main_ses_id": "1473804144079",
        "cp.utag_main__pn": "3",
        "cp.utag_main_dc_event": "3",
        "cp.utag_main_dc_region": "us-east-1",
        "cp.utag_main_stored_gclid": "CMPPng5ljiCFc6TL",
        "cp._ga": "GA1.2.411902962.1473786856",
        "cp.swCart": "active",
        "cp.swProds": "Kelly%20Slater%20Doing%20What%20He%20Does",
        "cp.swQty": "1",
        "cp.swSku": "lws-ks-01",
        "cp.swPrice": "34.99",
        "cp.swCat": "Lowers",
        "cp.swShip": "7.99",
        "cp.swPid": "ks-01",
        "cp.swScat": "Kelly%20Slater",
        "cp.swQCart": "34.99",
        "cp.folder": "tmu",
        "cp.account": "tu-partner-us",
        "cp.profile": "apt040",
        "cp.env": "prod",
        "cp.t_ID": "097109117206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206143143143206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206206194214211202196202208143194207197211194197198212",
        "qp.utm_campaign": "Kelly",
        "qp.utm_source": "google",
        "qp.utm_medium": "cpc",
        "qp.utm_term": "Kelly Slater",
        "qp.gclid": "CMPPng5ljiCFc6TL",
        "meta.description": "",
        "meta.author": "",
        "dom.referrer": "http://tagthis.co/google/",
        "dom.title": "SwellPrints - Kelly Slater with a Massive Boost at Lower Trestles, California, USA",
        "dom.domain": "tagthis.co",
        "dom.query_string": "utm_campaign=Kelly&utm_source=google&utm_medium=cpc&utm_term=Kelly%20Slater&gclid=CMPPng5ljiCFc6TL",
        "dom.hash": "",
        "dom.url": "http://tagthis.co/buy_kelly.html?utm_campaign=Kelly&utm_source=google&utm_medium=cpc&utm_term=Kelly%20Slater&gclid=CMPPng5ljiCFc6TL#",
        "dom.pathname": "/buy_kelly.html",
        "dom.viewport_height": 826,
        "dom.viewport_width": 555,
        "ut.domain": "",
        "ut.version": "ut4.42.201609132206",
        "ut.event": "view",
        "ut.visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "ut.session_id": "1473804144079",
        "ut.account": "tu-partner-us",
        "ut.profile": "apt040",
        "ut.env": "prod",
        "tealium_event": "view",
        "tealium_visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "tealium_session_id": "1473804144079",
        "tealium_datasource": "",
        "tealium_account": "tu-partner-us",
        "tealium_profile": "apt040",
        "tealium_environment": "prod",
        "tealium_random": "8855634907385064",
        "tealium_library_name": "utag.js",
        "tealium_library_version": "4.42.0",
        "tealium_timestamp_epoch": 1473805848,
        "tealium_timestamp_utc": "2016-09-13T22:30:48.616Z",
        "tealium_timestamp_local": "2016-09-13T15:30:48.616",
        "va.metrics.15": 4,
        "va.metrics.21": 4,
        "va.metrics.22": 463,
        "va.metrics.25": 47.166666666666664,
        "va.metrics.26": 15.722222222222221,
        "va.metrics.28": 0.028584656084656084,
        "va.dates.23": 1473786856000,
        "va.dates.24": 1473804144000,
        "va.dates.last_visit_start_ts": 1473804144000,
        "va.properties.17": "http://tagthis.co/readme.html",
        "va.properties.54": "Mac desktop",
        "va.properties.56": "Chrome",
        "va.properties.58": "Mac OS X",
        "va.properties.60": "browser",
        "va.properties.62": "Chrome",
        "va.properties.visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "va.properties.account": "tealiumuniversity",
        "va.properties.profile": "skilljar-dv",
        "va.flags.27": true,
        "va.preloaded": false,
        "va.metric_sets.55.Mac desktop": 3,
        "va.metric_sets.57.Chrome": 3,
        "va.metric_sets.59.Mac OS X": 3,
        "va.metric_sets.61.browser": 3,
        "va.metric_sets.63.Chrome": 3,
        "va.creation_ts": 1473786856000,
        "va._id": "0157245451240027bf5a1200832c05077002806f0093c",
        "va.expire_at.$date": "2017-10-18T21:20:43.000Z",
        "va.current_visit.metrics.7": 1,
        "va.current_visit.dates.10": 1473804144000,
        "va.current_visit.dates.last_event_ts": 1473804144000,
        "va.current_visit.properties.5": "http://tagthis.co/readme.html",
        "va.current_visit.properties.44": "Chrome",
        "va.current_visit.properties.45": "Mac OS X",
        "va.current_visit.properties.46": "Mac desktop",
        "va.current_visit.properties.47": "browser",
        "va.current_visit.properties.48": "Chrome",
        "va.current_visit.properties.5037": "tagthis.co",
        "va.current_visit.flags.14": true,
        "va.current_visit.property_sets.49": ["Chrome"],
        "va.current_visit.property_sets.50": ["Mac OS X"],
        "va.current_visit.property_sets.51": ["Mac desktop"],
        "va.current_visit.property_sets.52": ["browser"],
        "va.current_visit.property_sets.53": ["Chrome"],
        "va.current_visit.creation_ts": 1473804144000,
        "va.current_visit._id": "d73c1ea7ffc933fe63c6381f3f5435f77f85dfcfdb1c64ea84d747ee148ff5ac",
        "va.current_visit.last_event.account": "tealiumuniversity",
        "va.current_visit.last_event.profile": "skilljar-dv",
        "va.current_visit.last_event.selector": "2",
        "va.current_visit.last_event.env": "prod",
        "va.current_visit.last_event.tags.1.executed": true,
        "va.current_visit.last_event.tags.1.type": 20064,
        "va.current_visit.last_event.tags.1.profile": "readme",
        "va.current_visit.last_event.data.dom.title": "Tealium University SwellPrints - README FIRST",
        "va.current_visit.last_event.data.dom.referrer": "http://tagthis.co/buy_kelly.html?utm_campaign=Kelly&amp;utm_source=google&amp;utm_medium=cpc&amp;utm_term=Kelly%20Slater&amp;gclid=CMPPng5ljiCFc6TL",
        "va.current_visit.last_event.data.dom.hash": "",
        "va.current_visit.last_event.data.dom.domain": "tagthis.co",
        "va.current_visit.last_event.data.dom.viewport_width": 1440,
        "va.current_visit.last_event.data.dom.viewport_height": 826,
        "va.current_visit.last_event.data.dom.pathname": "/readme.html",
        "va.current_visit.last_event.data.dom.query_string": "",
        "va.current_visit.last_event.data.dom.url": "http://tagthis.co/readme.html",
        "va.current_visit.last_event.data.udo.ut?version": "ut4.40.201606131633",
        "va.current_visit.last_event.data.udo.timing?dns": 0,
        "va.current_visit.last_event.data.udo.ut?account": "tealiumuniversity",
        "va.current_visit.last_event.data.udo.timing?connect": 33,
        "va.current_visit.last_event.data.udo.timing?domain": "tagthis.co",
        "va.current_visit.last_event.data.udo.page_category": "Landing -- README",
        "va.current_visit.last_event.data.udo.timing?load": 5,
        "va.current_visit.last_event.data.udo.ut?session_id": "1473804144079",
        "va.current_visit.last_event.data.udo.timing?fetch_to_response": 113,
        "va.current_visit.last_event.data.udo.timing?fetch_to_complete": 626,
        "va.current_visit.last_event.data.udo.timing?pathname": "/buy_kelly.html",
        "va.current_visit.last_event.data.udo.timing?query_string": "utm_campaign=Kelly&amp;utm_source=google&amp;utm_medium=cpc&amp;utm_term=Kelly%20Slater&amp;gclid=CMPPng5ljiCFc6TL",
        "va.current_visit.last_event.data.udo.timing?timestamp": 1473801643299,
        "va.current_visit.last_event.data.udo.timing?dom_loading_to_interactive": 144,
        "va.current_visit.last_event.data.udo.timing?dom_interactive_to_complete": 366,
        "va.current_visit.last_event.data.udo.timing?front_end": 511,
        "va.current_visit.last_event.data.udo.ut?profile": "readme",
        "va.current_visit.last_event.data.udo.ut?event": "view",
        "va.current_visit.last_event.data.udo.ut?env": "prod",
        "va.current_visit.last_event.data.udo.ut?visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "va.current_visit.last_event.data.udo.timing?time_to_first_byte": 68,
        "va.current_visit.last_event.data.udo.ut?domain": "tagthis.co",
        "va.current_visit.last_event.data.udo.page_type": "landing_page",
        "va.current_visit.last_event.data.udo.page_name": "SwellPrints - ReadMe",
        "va.current_visit.last_event.data.udo.timing?fetch_to_interactive": 260,
        "va.current_visit.last_event.data.udo.timing?response": 2,
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main_dc_event": "1",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swCart": "active",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main__ss": "1",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swProds": "Kelly%20Slater%20Doing%20What%20He%20Does",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swPid": "ks-01",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main__st": "1473805944079",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main__pn": "1",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main_dc_visit": "5",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swQty": "1",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.t_ID": "097109117206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206143143143206194214211202196202208143194207197211194197198212134149145213198194205202214206143196208206206194214211202196202208143194207197211194197198212",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swSku": "lws-ks-01",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.env": "prod",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swQCart": "34.99",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swCat": "Lowers",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.folder": "tmu",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swShip": "7.99",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main_v_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main_ses_id": "1473804144079",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.account": "tu-partner-us",
        "va.current_visit.last_event.data.firstparty_tealium_cookies._ga": "GA1.2.411902962.1473786856",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swPrice": "34.99",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.swScat": "Kelly%20Slater",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.utag_main__sn": "5",
        "va.current_visit.last_event.data.firstparty_tealium_cookies.profile": "apt040",
        "va.current_visit.last_event.data.meta.author": "",
        "va.current_visit.last_event.data.meta.description": "",
        "va.current_visit.last_event.type": "LIVE",
        "va.current_visit.last_event.event_id": "e373b99c-f66b-4dc7-84cc-47b983a3e9e1",
        "va.current_visit.last_event.visitor_id": "0157245451240027bf5a1200832c05077002806f0093c",
        "va.current_visit.last_event.post_time": 1473804144000,
        "va.current_visit.last_event.page_url.full_url": "http://tagthis.co/readme.html",
        "va.current_visit.last_event.page_url.scheme": "http",
        "va.current_visit.last_event.page_url.domain": "tagthis.co",
        "va.current_visit.last_event.page_url.path": "/readme.html",
        "va.current_visit.last_event.referrer_url.full_url": "http://tagthis.co/readme.html",
        "va.current_visit.last_event.referrer_url.scheme": "http",
        "va.current_visit.last_event.referrer_url.domain": "tagthis.co",
        "va.current_visit.last_event.referrer_url.path": "/readme.html",
        "va.current_visit.last_event.useragent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2844.0 Safari/537.36",
        "va.current_visit.last_event._dctrace": ["us-east-1_uconnect_i-1a1d18e3", "us-east-1_eventstream_processor_i-7512178c", "us-east-1_visitor_processor_i-70121789"],
        "va.current_visit.last_event.new_visitor": false,
        "va.current_visit._dc_ttl_": 1800000,
        "va.current_visit.total_event_count": 1,
        "va.current_visit.events_compressed": false,
        "va.badges.30": true,
        "_ccity": "",
        "_ccountry": "US",
        "_ccurrency": "USD",
        "_ccustid": "",
        "_corder": "",
        "_cpromo": "",
        "_cship": "",
        "_cstate": "",
        "_cstore": "",
        "_csubtotal": "",
        "_ctax": "",
        "_ctotal": "",
        "_ctype": "",
        "_czip": "",
        "_cprod": ["ks-01"],
        "_cprodname": ["Kelly Slater Doing What He Does"],
        "_cbrand": [],
        "_ccat": ["Lowers"],
        "_ccat2": ["Kelly Slater"],
        "_cquan": [],
        "_cprice": ["34.99"],
        "_csku": ["lws-ks-01"],
        "_cpdisc": [],
        "dblclk_category": "tealkelly"
    },
    "udoname": "utag_data",
    "runonce": {
        "3": 1
    },
    "jdh": function(h, i, j, k) {
        h = utag.jdhc.length;
        if (h == 0) window.clearInterval(utag.jdhi);
        else {
            for (i = 0; i < h; i++) {
                j = utag.jdhc[i];
                k = jQuery(j.i).is(":visible") ? 1 : 0;
                if (k != j.s) {
                    if (j.e == (j.s = k)) jQuery(j.i).trigger(j.e ? "afterShow" : "afterHide")
                }
            }
        }
    },
    "jdhi": 3,
    "jdhc": [],
    "tagsettings": {
        "gua": {
            "trackernames": 1
        }
    }
}
