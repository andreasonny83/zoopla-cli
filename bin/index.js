#!/usr/bin/env node
// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';

const Zoopla = require('../lib/cli');

Promise.resolve().then(() => Zoopla());
