(function () {
    const WEDDING_AT = new Date("2026-09-09T19:00:00+03:00");
    const cover = document.getElementById("cover");
    const openInvite = document.getElementById("openInvite");
    const song = document.getElementById("song");
    const countdown = document.getElementById("countdown");
    const countDone = document.getElementById("countDone");
    const addToCalendar = document.getElementById("addToCalendar");
    const IMAGE_EXTS = ["jpeg", "jpg", "png", "webp"];

    function loadPhoto(fileName, onFound) {
        let index = 0;

        function tryNext() {
            if (index >= IMAGE_EXTS.length) return;
            const test = new Image();
            const src = "images/" + fileName + "." + IMAGE_EXTS[index];
            index += 1;
            test.onload = function () {
                onFound(src);
            };
            test.onerror = tryNext;
            test.src = src;
        }

        tryNext();
    }

    loadPhoto("2", function (src) {
        var img = document.getElementById("slideA");
        if (img) img.src = src;
    });

    cover.classList.add("is-ready");
    document.body.classList.add("is-locked");

    var autoScrollTimer = 0;
    var autoScrollFrame = 0;
    var autoScrolling = false;
    var canCancelAutoScroll = false;

    function scrollYNow() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function setScrollY(y) {
        window.scrollTo(0, y);
        document.documentElement.scrollTop = y;
        document.body.scrollTop = y;
    }

    function stopAutoScroll() {
        if (!canCancelAutoScroll && autoScrolling) return;
        autoScrolling = false;
        canCancelAutoScroll = false;
        if (autoScrollTimer) {
            window.clearTimeout(autoScrollTimer);
            autoScrollTimer = 0;
        }
        if (autoScrollFrame) {
            window.cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = 0;
        }
    }

    function startSlowScroll() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        var from = 0;
        setScrollY(from);
        var to = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (to <= 8) return;

        autoScrolling = true;
        canCancelAutoScroll = false;
        window.setTimeout(function () {
            canCancelAutoScroll = true;
        }, 400);

        var started = performance.now();
        var pixelsPerSecond = 38;
        var duration = Math.max(22000, (to / pixelsPerSecond) * 1000);

        function step(now) {
            if (!autoScrolling) return;
            to = Math.max(to, document.documentElement.scrollHeight - window.innerHeight);
            var t = Math.min(1, (now - started) / duration);
            setScrollY(from + (to - from) * t);
            if (t < 1) {
                autoScrollFrame = window.requestAnimationFrame(step);
            } else {
                autoScrolling = false;
                canCancelAutoScroll = false;
            }
        }

        autoScrollFrame = window.requestAnimationFrame(step);
    }

    function openInvitation() {
        if (cover.classList.contains("is-open")) return;
        tryPlay();
        cover.classList.add("is-open");
        document.body.classList.remove("is-locked");
        setScrollY(0);
        autoScrollTimer = window.setTimeout(startSlowScroll, 900);
    }

    openInvite.addEventListener("click", openInvitation);

    window.addEventListener("wheel", stopAutoScroll, { passive: true });
    window.addEventListener("touchmove", stopAutoScroll, { passive: true });
    window.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "PageDown" || event.key === " " ) {
            stopAutoScroll();
        }
    });

    function tryPlay() {
        if (!song) return;
        song.volume = 0.42;
        var playPromise = song.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function stopSong() {
        if (!song) return;
        song.pause();
        song.currentTime = 0;
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            if (song) song.pause();
            return;
        }
        if (cover.classList.contains("is-open")) tryPlay();
    });

    window.addEventListener("pagehide", stopSong);

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function tick() {
        const diff = WEDDING_AT.getTime() - Date.now();
        if (diff <= 0) {
            countdown.classList.add("is-done");
            countDone.hidden = false;
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        countdown.querySelector('[data-unit="days"]').textContent = pad(days);
        countdown.querySelector('[data-unit="hours"]').textContent = pad(hours);
        countdown.querySelector('[data-unit="minutes"]').textContent = pad(minutes);
        countdown.querySelector('[data-unit="seconds"]').textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);

    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("is-in");
        });
    }

    if (addToCalendar) addToCalendar.addEventListener("click", function () {
        const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Maher & Karolin//Wedding//AR",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            "DTSTAMP:20260909T000000Z",
            "DTSTART:20260909T160000Z",
            "DTEND:20260909T200000Z",
            "SUMMARY:زفاف ماهر وكارولين",
            "LOCATION:دير سيدة صيدنايا",
            "DESCRIPTION:نتشرف بدعوتكم لحضور حفل زفاف ماهر وكارولين — الساعة السابعة مساءً.",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "maher-karolin-wedding.ics";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });
})();
