import songs from "./songs.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player');
const heading = $("header h2");
const cdThumbNail = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
var screenWidth = window.innerWidth;
const apps = {
    isPlaying: false,
    currentIndex: 0,
    songs: songs,

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    render: function () {
        const htmls = this.songs.map((song) => {
            return `
        <div class="song">
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
    `;
        });
        $(".playlist").innerHTML = htmls.join("");
    },

    handleEvents: function () {
        // handle when swipe down and up
        const cd = $(".cd");
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop = window.scrollY;
            const newCDWidth = cdWidth - scrollTop;
            cd.style.width = newCDWidth > 0 ? newCDWidth + "px" : 0;
            cd.style.opacity = newCDWidth / cdWidth;
        };

        //handle cd rotate
        const animateCD = cdThumbNail.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 30000,
            iterations: Infinity
        });
        animateCD.pause();

        // handle when click play
        const _this = this;
        playBtn.onclick = function () {
            if (!_this.isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        };

        //handle when audio play or pause
        audio.onplay = function () {
            player.classList.add('playing');
            _this.isPlaying = true;
            animateCD.play();
        }

        audio.onpause = function () {
            player.classList.remove('playing');
            _this.isPlaying = false;
            animateCD.pause();
        }

        var isMouseDown = false;
        var isMouseUp = false;

        audio.ontimeupdate = function () {
            if (audio.duration && !isMouseDown) {
                const statusPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = statusPercent;
            }
        }
        // handle when rewind
        if (screenWidth <= 450) {
            progress.addEventListener('touchstart', function (e) {
                isMouseDown = true;
                isMouseUp = false;
            });

            progress.addEventListener('touchend', function (e) {
                isMouseUp = true;
                isMouseDown = false;
                audio.currentTime = (e.target.value / 100) * (audio.duration);
            });

        }
        else {
            progress.addEventListener('mousedown', function (e) {
                isMouseDown = true;
                isMouseUp = false;
            });

            progress.addEventListener('mouseup', function (e) {
                isMouseUp = true;
                isMouseDown = false;
                audio.currentTime = (e.target.value / 100) * (audio.duration);
            });

        }

        // progress.oninput = function () {
        //     audio.currentTime = (this.value / 100) * (audio.duration);
        // }

        // hanlde next song
        nextBtn.onclick = function () {
            _this.nextSong();
            if (_this.isPlaying) {
                audio.play();
            }
        }

        // handle previous song
        prevBtn.onclick = function () {
            _this.previousSong();
            if (_this.isPlaying) {
                audio.play();
            }
        }

    },

    loadCurrentSong: function () {
        //operating

        heading.textContent = this.currentSong.name;
        cdThumbNail.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    nextSong: function () {
        if (this.currentIndex === this.songs.length - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        this.loadCurrentSong();
    },

    previousSong: function () {
        if (this.currentIndex === 0) {
            this.currentIndex = this.songs.length - 1;
        } else {
            this.currentIndex--;
        }
        this.loadCurrentSong();
    },

    start: function () {
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
    },
};

apps.start();
