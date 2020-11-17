module.exports = (index) => {
    //TODO: Input validation and testing?
    const videos = [
        "https://r4---sn-n4v7sn76.googlevideo.com/videoplayback?expire=1605585492&ei=9PWyX6LpKtPAkgb6w6mABg&ip=2620%3A149%3Ae0%3A5003%3A%3A3e4&id=o-AKJPlwlevJibgJbzxnqE2tjmjkGeCP6vjB682tiBGXhH&itag=22&source=youtube&requiressl=yes&mh=UR&mm=31%2C26&mn=sn-n4v7sn76%2Csn-a5mekn7r&ms=au%2Conr&mv=m&mvi=4&pl=59&initcwndbps=2212500&vprv=1&mime=video%2Fmp4&ratebypass=yes&dur=1342.020&lmt=1598882110520445&mt=1605563803&fvip=4&c=WEB&txp=5535432&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAIPdPFLCG4ANcSft3vbVN84jIORNn1KvJlcu0dTJvFlVAiEAsXv6aK8-2L_hiDuphCE1aZaU4zs8qNSwQbq-zzFr6qM%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAKTe1M1WKgNib8-qhtt_3zAaHNEs5LtUP2eESpBU6GxCAiAkOXm2YirWTOcCgQkEAtcONi44d538Afwxd1q77eojDw%3D%3D",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ];

    return { url: videos[index] };
};