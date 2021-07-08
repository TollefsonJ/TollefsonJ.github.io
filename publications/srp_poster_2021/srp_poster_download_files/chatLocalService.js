function getNewTokenService(identity) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/Templates/iPosters/iPosterService.asmx/GetNewToken',
            type: 'POST',
            data: JSON.stringify({ clientId: identity }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                let jsonData = JSON.parse(data.d);
                resolve(jsonData);
            },
            error: function (error) {
                reject(error);
            },
        })
    })
}
function deleteChannelService(channelId, clientId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/Templates/iPosters/iPosterService.asmx/DeleteChannel',
            type: 'POST',
            data: JSON.stringify({ id: channelId }),

            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                let jsonData = JSON.parse(data.d);
                resolve(jsonData);
            },
            error: function (error) {
                reject(error)
            },
        })
    })
}
function getAllFormattedMessagesService(channelId, clientId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/Templates/iPosters/iPosterService.asmx/GetAllFormattedMessages',
            type: 'POST',
            data: JSON.stringify({ channelId: channelId }),

            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                //let jsonData = JSON.parse(data.d);
                resolve(data);
            },
            error: function (error) {
                reject(error)
            },
        })
    })
}
function getAllRawMessagesService(channelId, clientId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/Templates/iPosters/iPosterService.asmx/GetAllRawMessages',
            type: 'POST',
            data: JSON.stringify({ channelId: channelId }),

            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                //let jsonData = JSON.parse(data.d);
                resolve(data);
            },
            error: function (error) {
                reject(error)
            },
        })
    })
}



