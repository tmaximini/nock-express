// Error handling middleware

exports.errorHandler = function(err, req, res, next) {
    "use strict";

    console.log("error handler says hello")

    console.error(err.message);
    console.error(err.stack);
    res.status(500);

    //res.render('error_template', { error: err });

    res.end({ error: err });
}
