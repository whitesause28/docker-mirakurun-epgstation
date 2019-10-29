const spawn = require('child_process').spawn;
const ffmpeg = process.env.FFMPEG;

const input = '\"' + process.env.INPUT + '\"';
const output = '\"' + process.env.OUTPUT + '\"';
const analyzedurationSize = '30M'; // 30sec Mirakurun の設定に応じて変更すること
const probesizeSize = '30M'; // 30MB Mirakurun の設定に応じて変更すること
const maxMuxingQueueSize = 1024;
const dualMonoMode = 'main';
const videoHeight = parseInt(process.env.VIDEORESOLUTION, 10);
const isDualMono = parseInt(process.env.AUDIOCOMPONENTTYPE, 10) == 2;
const audioBitrate = videoHeight > 720 ? '160k' : '128k';
const codec = 'h264_qsv';
const crf = 30;

//const args = ['-v', 'verbose', '-hwaccel', 'qsv', '-y', '-analyzeduration', analyzedurationSize, '-probesize', probesizeSize];
const args = ['-hwaccel', 'qsv', '-y', '-fflags', '+discardcorrupt', '-analyzeduration', analyzedurationSize, '-probesize', probesizeSize];

// dual mono 設定
if (isDualMono) {
    Array.prototype.push.apply(args, ['-dual_mono_mode', dualMonoMode]);
}

// input 設定
Array.prototype.push.apply(args,['-c:v', 'mpeg2_qsv', '-c:a', 'aac']);
Array.prototype.push.apply(args,['-i', input]);

// メタ情報を先頭に置く
Array.prototype.push.apply(args,['-movflags', 'faststart']);

// 字幕データを含めたストリームをすべてマップ
Array.prototype.push.apply(args, ['-map', '0:v', '-map', '0:a', '-map', '0:s', '-ignore_unknown', '-max_muxing_queue_size', maxMuxingQueueSize, '-c:s', 'mov_text']);


// video filter 設定
let videoFilter = 'vpp_qsv=deinterlace=2';
//if (videoHeight > 720) {
//    videoFilter += ',scale_qsv=w=1280:h=720'
//}
videoFilter += ':framerate=30000/1001';
Array.prototype.push.apply(args, ['-vf', videoFilter]);

// その他設定
Array.prototype.push.apply(args,[
    '-aspect', '16:9',
    '-c:v', codec,
    '-global_quality:v', crf,
    '-preset:v', 'veryslow',
    '-b_strategy', '1',
    '-look_ahead', '1',
    '-look_ahead_depth', '50',
    '-look_ahead_downsampling', 'auto',
    '-rdo', '1',
    '-g', '300',
    '-brand', 'mp42',
    '-c:a', 'libfdk_aac',
    '-ar', '48000',
    '-ab', audioBitrate,
    '-ac', '2',
    output
]);

let str = '';
for (let i of args) {
    str += ` ${ i }`
}
console.error(str);

const child = spawn(ffmpeg, args, { shell: true});

child.stderr.on('data', (data) => { console.error(String(data)); });

child.on('error', (err) => {
    console.error(err);
    throw new Error(err);
});

process.on('SIGINT', () => {
    child.kill('SIGINT');
});

