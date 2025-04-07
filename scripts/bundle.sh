#! /usr/bin/env bash

rm itoam-ts-fullstack.bundle.gz
git bundle create itoam-ts-fullstack.bundle --all
git bundle verify itoam-ts-fullstack.bundle
gzip itoam-ts-fullstack.bundle
