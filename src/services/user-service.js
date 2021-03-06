const express = require('express');
const router = express.Router();

const userQuery = require("./../db/queries/user-query");
const status = require("./../status/status");
const { body, header, validationResult } = require('express-validator');
const dateTimeUtil = require('./../utils/date-util');
const tokenUtil = require('../utils/token-util');


/**
 * post method route for user registration
 */
router.post('/register', [
    body('username').isEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)],
    function (req, res) {
        registerUser(req, res);
    });

/**
 * post method route for login
 */
router.post('/login', [
    body('username').isEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)],
    function (req, res) {
        login(req, res);
    });

/**
 * post method route for logout
 */
router.patch('/logout', [
    header('Authorization').exists()],
    function (req, res) {
        logout(req, res);
    });

function registerUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).send(status.invalidRequestStatus(422, 'Invalid Value'))
    } else {
        userQuery.saveUser(req.body).then(result => {
            if (result.success) {
                res.status(result.statusCode).send(status.successStatus(result.message, result.data || {}));
            } else {
                res.status(result.statusCode).send(status.invalidRequestStatus(result.statusCode, result.message));
            }
        }).catch(error => {
            console.error(`${dateTimeUtil.getCurrentDateTime()} Something went wrong while saving user ${error}`);
            res.status(500).send(status.serverError())
        })
    }
}

function login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).send(status.invalidRequestStatus(422, 'Invalid Value'))
    } else {
        userQuery.loginUser(req.body).then(result => {
            if (result.success) {
                res.status(result.statusCode).send(status.successStatus(result.message, result.data || {}));
            } else {
                res.status(result.statusCode).send(status.invalidRequestStatus(result.statusCode, result.message));
            }
        }).catch(error => {
            console.error(`${dateTimeUtil.getCurrentDateTime()} Something went wrong while fetching user ${error}`);
            res.status(500).send(status.serverError())
        })
    }
}

function logout(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).send(status.invalidRequestStatus(422, 'Invalid Value'))
    } else {
        tokenUtil.validateToken(req.headers['authorization'], function (validateResponse) {
            if (validateResponse.success) {
                res.status(200).send(status.successStatus());
            } else {
                res.status(403).send(status.accessDeniedStatus());
            }
        });
    }
}

module.exports = router;