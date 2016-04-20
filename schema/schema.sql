
CREATE DATABASE oauth;

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone="+00:00";

CREATE TABLE oauth_clients (
    client_id text NOT NULL,
    client_secret text NOT NULL,
    redirect_uri text NOT NULL,
    api_key text NOT NULL,
    created_by text NOT NULL
) TYPE=MyISAM;