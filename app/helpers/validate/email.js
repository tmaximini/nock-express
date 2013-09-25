module.exports = function(email){
    // false when validation fails
    return (/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i).test(email);
}