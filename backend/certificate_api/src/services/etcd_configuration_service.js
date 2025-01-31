const {Etcd3} = require('etcd3');
const sanitizeHtml = require('sanitize-html');

const config = require('../../configs/config');
const {TEMPLATES} = require('../../configs/constants');
let etcdClient;
let configuration;
let vaccineCertificateTemplate = null, testCertificateTemplate = null;

function init() {
  etcdClient = new Etcd3({hosts: config.ETCD_URL});
  setUpWatcher(TEMPLATES.VACCINATION_CERTIFICATE);
  setUpWatcher(TEMPLATES.TEST_CERTIFICATE);
  configuration = config.CONFIGURATION_LAYER.toLowerCase() === 'etcd' ? new etcd(): null ;
}

function cleanHTML(html) {
  if(html === null) {
    return null;
  }
  const cleanedHtml = sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowedClasses: {
      "*": ["*"]
    },
    parser: {
      lowerCaseAttributeNames: false
    },
    allowedScriptDomains: [''],
    allowedScriptHostnames: [''],
    allowedIframeHostnames: [''],
    allowedIframeDomains: ['']
  });
  return cleanedHtml;
}

function updateTemplate(templateKey, template) {
  switch(templateKey) {
    case TEMPLATES.VACCINATION_CERTIFICATE:
      vaccineCertificateTemplate = template;
      break;
    case TEMPLATES.TEST_CERTIFICATE:
      testCertificateTemplate = template;
      break;
  }
}

function setUpWatcher(templateKey) {
  etcdClient.watch()
    .key(templateKey)
    .create()
    .then(watcher => {
      watcher
      .on('end', (end) => {
        console.log('end')
      })
      .on('connected', (req) => {
        console.log('connected');
      })
      .on('put', res => {
        updateTemplate(templateKey, res.value.toString());
      });
    })
    .catch(err => {
      console.log(err);
    });
}

async function loadCertificateTemplate(key) {
  let certificateTemplate;
  switch(key) {
    case TEMPLATES.VACCINATION_CERTIFICATE:
      certificateTemplate = vaccineCertificateTemplate;
      break;
    case TEMPLATES.TEST_CERTIFICATE:
      certificateTemplate = testCertificateTemplate;
      break;
  }
  if(certificateTemplate === null || certificateTemplate === undefined) {
    if(configuration === null || configuration === undefined) {
      return null;
    }
    certificateTemplate = await configuration.getCertificateTemplate(key);
  }
  return certificateTemplate;
}

class CertificateTemplate {
  async getCertificateTemplate(key) {
    let certificateTemplate = await loadCertificateTemplate(key);
    certificateTemplate = cleanHTML(certificateTemplate);
    updateTemplate(key, certificateTemplate);
    return certificateTemplate;
  }
}

const etcd = function() {
  this.getCertificateTemplate = async function(templateKey) {
    const template = (await etcdClient.get(templateKey).string());
    return template;
  }
}

module.exports = {
  CertificateTemplate, init
}