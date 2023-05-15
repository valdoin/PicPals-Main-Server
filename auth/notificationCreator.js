const { User } = require("../model/User")

//quand l'utilisateur poste, cette fonction est appelée pour mettre a jour les notifs de tous ses amis
exports.createHasPostedNotification = async(token) =>{
    User.findById(token.id).populate("friends").then((user) => {
        user.friends.forEach((friend) => {
            friend.notifications.push(`hasposted:${token.id}`)
            friend.save()
        })
    })
}

exports.createTimeToPostNotification = async() => {
    User.find().then((users) => {
        users.forEach((user) => {
            user.notifications.push("couc")
            user.save()
        })
    })
}

exports.deleteAllNotifications = async() => {
    User.find().then((users) => {
        users.forEach((user) => {
            user.notifications = []
            user.save()
        })
    })
}

exports.deleteUserNotifications = async (phone) => {
    User.findOne({phone: phone}).then((user) => {
        user.notifications = []
        user.save()
    })
}

//TODO : notif commentaire +gestion notif coté client