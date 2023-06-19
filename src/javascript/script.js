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
const randomBtn = $('.btn-random');
const repeateBtn = $('.btn-repeat');
const playList = $(".playlist");
const MUSIC_PLAYER = 'Music player';
var screenWidth = window.innerWidth;
const apps = {
    isRepeate: false,
    isShuffled: false,
    isPlaying: false,
    currentIndex: 0,
    songs: songs,
    config: JSON.parse(localStorage.getItem(MUSIC_PLAYER)) || {},
    setConFig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(MUSIC_PLAYER, JSON.stringify(this.config));
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
        <div id="${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
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
        playList.innerHTML = htmls.join("");
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
        // audio real time
        audio.ontimeupdate = function () {
            if (audio.duration && !isMouseDown) {
                const statusPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = statusPercent;
            }
        }

        // ended audio
        audio.onended = function () {
            if (!_this.isRepeate) {
                _this.nextSong();
            }
            audio.play();
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
            // if (_this.isPlaying) {
            progress.value = 0;
            audio.play();
            // }
        }

        // handle previous song
        prevBtn.onclick = function () {
            _this.previousSong();
            // if (_this.isPlaying) {
            progress.value = 0;
            audio.play();
            // }
        }

        // handle shuffled song
        randomBtn.onclick = function () {
            _this.isShuffled = !_this.isShuffled;
            _this.setConFig('isShuffled', _this.isShuffled);
            if (_this.isShuffled) {
                _this.isRepeate = false;
                _this.setConFig('isRepeate', _this.isRepeate);
                repeateBtn.classList.remove('active');
            }
            this.classList.toggle('active', _this.isShuffled);
        }

        // handle repeate song
        repeateBtn.onclick = function () {
            _this.isRepeate = !_this.isRepeate;
            _this.setConFig('isRepeate', _this.isRepeate);
            if (_this.isRepeate) {
                _this.isShuffled = false;
                _this.setConFig('isShuffled', _this.isShuffled);
                randomBtn.classList.remove('active');
            }
            this.classList.toggle('active', _this.isRepeate);
        }

        // handle click playlist
        playList.onclick = function (event) {
            const songElement = event.target.closest('.song:not(.active)');
            if (songElement || event.target.closest('.option')) {
                if (songElement) {
                    _this.currentIndex = parseInt(songElement.getAttribute('id'));
                    _this.loadCurrentSong();
                    audio.play();
                }
            }
        }

    },

    loadCurrentSong: function () {
        //operating
        heading.textContent = this.currentSong.name;
        cdThumbNail.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        if ($('.song.active')) {
            $('.song.active').classList.remove('active');
            document.getElementById(`${this.currentIndex}`).classList.add('active');
            this.scrollActiveSong();
        }
        this.setConFig('currentIndex', this.currentIndex);

    },

    scrollActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        }, 200)
    },

    nextSong: function () {
        if (this.isShuffled) {
            const randomNumber = this.shuffledSong();
            if (randomNumber === this.currentIndex) {
                if (this.currentIndex === this.songs.length - 1) {
                    this.currentIndex = 0;
                } else {
                    this.currentIndex++;
                }
            } else {
                this.currentIndex = randomNumber;
            }
        } else {
            if (this.currentIndex === this.songs.length - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
        }
        this.loadCurrentSong();
    },

    previousSong: function () {
        if (this.isShuffled) {
            const randomNumber = this.shuffledSong();
            if (randomNumber === this.currentIndex) {
                if (this.currentIndex === 0) {
                    this.currentIndex = this.songs.length - 1;
                } else {
                    this.currentIndex--;
                }
            } else {
                this.currentIndex = randomNumber;
            }
        }
        else {
            if (this.currentIndex === 0) {
                this.currentIndex = this.songs.length - 1;
            } else {
                this.currentIndex--;
            }
        }
        this.loadCurrentSong();
    },

    shuffledSong: function () {
        const randomNumber = Math.floor(Math.random() * (this.songs.length));
        return randomNumber;
    },

    configFunction: function () {
        const config = this.config;
        this.isRepeate = config.isRepeate;
        this.isShuffled = config.isShuffled;
        this.currentIndex = config.currentIndex;
        if (this.isRepeate) {
            repeateBtn.classList.add('active');
        }

        if (this.isShuffled) {
            randomBtn.classList.add('active');
        }
    },

    start: function () {
        this.configFunction();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
    },
};
apps.start();
