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

    function openInvitation() {
        if (cover.classList.contains("is-open")) return;
        tryPlay();
        cover.classList.add("is-open");
        document.body.classList.remove("is-locked");
        window.scrollTo(0, 0);
    }

    openInvite.addEventListener("click", openInvitation);

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

    addToCalendar.addEventListener("click", function () {
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
