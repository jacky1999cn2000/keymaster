/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  aws:{
    region: 'us-west-2',
  	endpoint: 'dynamodb.us-west-2.amazonaws.com',
  	accessKeyId: 'AKIAIPEP57MOSUKILUEA',
  	secretAccessKey: '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'
  }

};
