const keys = require('../../config/keys');
module.exports = (survey) => {
  return `
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title></title>
      </head>
      <body>
        <div style="text-align:center">
          <h3>I'd Like your input</h3>
          <p>Please answer the following question</p>
          <p>${survey.body}</p>
          <div>
            <a href="${keys.redirectDomain}/api/surveys/${survey.id}/yes">Yes</a>
          </div>
          <div>
            <a href="${keys.redirectDomain}/api/surveys/${survey.id}/no">No</a>
          </div>
        </div>
      </body>
    </html>
  `;
}
