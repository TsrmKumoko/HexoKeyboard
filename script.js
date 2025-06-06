var transpose = 0;
// 创建钢琴音色
const synth = new Tone.Sampler({
    urls: {
        "A0": "A0.mp3",
        "C1": "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        "A1": "A1.mp3",
        "C2": "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        "A2": "A2.mp3",
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        "A5": "A5.mp3",
        "C6": "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        "A6": "A6.mp3",
        "C7": "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        "A7": "A7.mp3",
        "C8": "C8.mp3"
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();

// 获取所有键
const keys = document.querySelectorAll('.key');
const activeNotesDiv = document.getElementById('active-notes');

// 存储当前显示的音符
const activeNotes = new Set();

// 音符名称数组，C2为0
const noteNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

setAllNotes();

function getNoteName(noteValue) {
    const octave = Math.floor(noteValue / 12) + 2; // C2是第2个八度
    const noteIndex = noteValue % 12;
    return noteNames[noteIndex] + octave;
}

function setAllNotes() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(keyElement => {
        if (keyElement.classList.contains('skip-key')) return; // 跳过skip-key的处理;
        const tone = parseInt(keyElement.dataset.tone);
        const noteValue = tone + transpose;
        const noteName = getNoteName(noteValue);

        keyElement.dataset.note = noteName;
        keyElement.innerText = noteName.replace(/[0-9]/g, '');

        if (noteName.includes('#') || noteName.includes('b')) {
            keyElement.classList.add('black-key');
        } else {
            keyElement.classList.remove('black-key');
        }
    });
}

// 更新显示的音符
function updateActiveNotes() {
    // 获取音符数组并按照规则排序：1.八度较小的放在前面 2.同一个八度内按照音符顺序排序
    const notes = Array.from(activeNotes).sort((a, b) => {
        // 提取八度数字
        const octaveA = parseInt(a.match(/\d+/)[0]);
        const octaveB = parseInt(b.match(/\d+/)[0]);

        // 如果八度不同，八度小的排在前面
        if (octaveA !== octaveB) {
            return octaveA - octaveB;
        }

        // 如果八度相同，按照音符顺序排序
        const noteA = a.replace(/\d+/, ''); // 移除数字，只保留音符名称
        const noteB = b.replace(/\d+/, '');

        return noteNames.indexOf(noteA) - noteNames.indexOf(noteB);
    });

    // 更新显示
    activeNotesDiv.innerHTML = notes
        .map(note => `<span class="note-tag">${note}</span>`)
        .join('');

    // 检测和弦
    if (notes.length >= 2) {
        const chord = Tonal.Chord.detect(notes);
        if (chord.length > 0) {
            activeNotesDiv.innerHTML += ` = <span class="chord-tag">${chord[0]}</span>`;
        }
    }

    // 根据是否有音符来设置清除按钮的禁用状态
    clearBtn.disabled = notes.length === 0;
}

// 切换音符显示状态
function toggleNote(note) {
    if (activeNotes.has(note)) {
        activeNotes.delete(note);
    } else {
        activeNotes.add(note);
    }
    updateActiveNotes();
}

// 修改鼠标事件
keys.forEach(key => {
    key.addEventListener('mousedown', () => {
        const note = key.dataset.note;
        if (note) { // 确保note存在才播放
            synth.triggerAttack(note);
            key.classList.add('active');
            toggleNote(note);  // 保持鼠标点击的切换逻辑
        }
    });

    key.addEventListener('mouseup', () => {
        const note = key.dataset.note;
        if (note) {
            synth.triggerRelease([note]);
            key.classList.remove('active');
        }
    });

    key.addEventListener('mouseleave', () => {
        const note = key.dataset.note;
        if (note) {
            synth.triggerRelease([note]);
            key.classList.remove('active');
        }
    });
});

const muteBtn = document.getElementById('mute-btn');
let isMuted = false;

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted');

    if (isMuted) {
        synth.volume.value = -Infinity;
    } else {
        synth.volume.value = 0;
    }
});

const clearBtn = document.getElementById('clear-btn');
clearBtn.disabled = true;  // 设置初始状态为禁用

clearBtn.addEventListener('click', () => {
    // 清除所有激活的音符
    activeNotes.clear();
    // 释放所有按键的声音
    synth.releaseAll();
    // 移除所有键的激活状态
    document.querySelectorAll('.key.active').forEach(key => {
        key.classList.remove('active');
    });
    // 更新显示
    updateActiveNotes();
});

// 添加键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.repeat) return; // 防止按键重复触发

    const key = e.key;
    // console.log(key);
    // 查找对应的按键元素
    var keyElement;
    if (key === '\\') {
        keyElement = document.querySelector(`.key[data-key="Backslash"]`);
    } else {
        keyElement = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`) || document.querySelector(`.key[data-key="${key}"]`);
    }

    if (keyElement) {
        // 添加active类
        keyElement.classList.add('active');

        // 如果有音符数据，则播放声音
        const note = keyElement.dataset.note;
        if (note) {
            synth.triggerAttack(note);
            activeNotes.add(note);
            updateActiveNotes();
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key;
    // 查找对应的按键元素
    var keyElement;
    if (key === '\\') {
        keyElement = document.querySelector(`.key[data-key="Backslash"]`);
    } else {
        keyElement = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`) || document.querySelector(`.key[data-key="${key}"]`);
    }

    if (keyElement) {
        // 移除active类
        keyElement.classList.remove('active');

        // 如果有音符数据，则停止声音
        const note = keyElement.dataset.note;
        if (note) {
            synth.triggerRelease([note]);
            activeNotes.delete(note);
            updateActiveNotes();
        }
    }
});

// 禁用F12打开开发者工具和Tab
document.addEventListener('keydown', function (event) {
    if (event.key === 'F12' || event.key === 'Tab') {
        event.preventDefault();
        return false;
    }
});

// 禁用右键菜单
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    return false;
});

// 初始化按键音符
setAllNotes();

// 你可能还需要一个方法来更新transpose并重新调用setAllNotes
// 例如：
// function changeTranspose(newTranspose) {
//     transpose = newTranspose;
//     setAllNotes();
// }
