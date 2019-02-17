//Useragent test and judge
// alert(navigator.userAgent);
if (navigator.userAgent.search("MicroMessenger") != -1 || navigator.userAgent.search("QQ") != -1) {
    $("#useragent").show();
}

//兼容性测试
const getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

//Get camera
if (!getUserMedia) {
    $('#alert_camera').show();
} else {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "user"
        },
        audio: false
    }).then((stream) => {
        $("#img_hint").hide();
        $("#img_camera").show();
        $("#img_camera")[0].srcObject = stream;
        $("#img_camera")[0].play();
        postApi();
    }, (err) => {
        $('#alert_camera').show();
    });
}

//Bootstrap popover
$('[data-toggle="popover"]').popover();

//Canvas
let ctx = $("#img_canvas")[0].getContext("2d");
let imgData = $("#img_canvas")[0].toDataURL("img/png").substr(22);

//Get data per X00ms
setInterval(() => {
    ctx.drawImage($("#img_camera")[0], 0, 0, 200, 150);
    imgData = $("#img_canvas")[0].toDataURL("img/png").substr(22);
}, 100);

//Ajax by button(For Test)
// $("#btn_submit").on("click", () => {
//     $.ajax({
//         url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
//         type: "POST",
//         data: {
//             api_key: "3xME1UDV5MLzVAmiSgT8Rq-CEVQWKMu6",
//             api_secret: "6l2D14sgc91boa3I6CO-tixfn9fmDKCG",
//             image_base64: imgData,
//             return_landmark: 1,
//         },
//         success: (data) => {
//             console.log(data);
//             //$("#data_result").text(JSON.stringify(data.faces[0].landmark));
//             judgeLip(data);
//         },
//         error: (err) => {
//             alert(err.status);
//         }
//     })
// })

//Ajax auto - Post data to API
function postApi() {
    setInterval(() => {
        $.ajax({
            url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
            type: "POST",
            data: {
                api_key: secret.api_key,
                api_secret: secret.api_secret,
                image_base64: imgData,
                return_landmark: 1,
            },
            success: (data) => {
                judgeLip(data);
            },
            error: (err) => {
                console.error(err.status);
                $('#alert_net').show();
            },
            timeout: 2000
        })
    }, 500);
}

//Judge lip point
function judgeLip(data) {
    let lipPoint = data.faces[0].landmark;
    let x = lipPoint.mouth_lower_lip_top.y - lipPoint.mouth_upper_lip_bottom.y;
    let y = lipPoint.mouth_right_corner.x - lipPoint.mouth_left_corner.x;
    console.log(x, y);
    if (x <= 1) {
        $("#data_char").text("未张嘴");
    } else if (x > 1 && x < 8) {
        $("#data_char").text("你");
    } else if (x >= 8) {
        $("#data_char").text("好");
    }
}

//Push char to tts array
let tts_array = [];
$("#btn_submit").on("click", () => {
    tts_array.push($("#data_char").text());
    console.log(tts_array);
    $("#data_tts").val(tts_array.join(""));
})
//Baidu TTS API button
/**
 * 获取token地址（此api不支持跨域，所以需要手动刷新
 *  
 * https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=Va5yQRHl********LT0vuXV4&client_secret=0rDSjzQ20XUj5i********PQSzr5pVw2
 * */
$("#data_play").on("click", () => {
    let tok = "24.2955395accf86bb2737850453eb0769a.2592000.1537491373.282335-11709606"
    $("#data_sound").attr("src", `http://tsn.baidu.com/text2audio?tex=${$("#data_tts").val()}&lan=zh&cuid=abcd&ctp=1&tok=${tok}`);
    $("#data_sound").attr("autoplay", true);
    tts_array = [];
    $("#data_tts").val("");
})

//优化input体验
$("#data_tts").on("focusout", () => {
    tts_array = $("#data_tts").val().split("");
})

//Delete按钮实现
document.getElementById('data_delete').addEventListener('click', () => {
    tts_array.pop();
    document.getElementById('data_tts').value = tts_array.join("");
})