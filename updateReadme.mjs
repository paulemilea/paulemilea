import fs from 'fs';
import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'paulemilea';
const REPO_NAME = 'paulemilea';

const readmePath = './README.md';

const getFormattedDate = (hour = false) => {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return hour
    ? `${day}/${month}/${year} at ${hours}:${minutes}`
    : `${day}/${month}/${year}`;
};

async function updateReadme() {
  const content = fs.readFileSync(readmePath, 'utf-8').trim();

  const newLine = `Updated on ${getFormattedDate()}`;

  let newContent;
  if (content.split('\n').pop().startsWith('Updated on')) {
    newContent = content.split('\n').slice(0, -1).join('\n') + `\n${newLine}`;
  } else {
    newContent = content + `\n\n${newLine}`;
  }

  const sha = await getReadmeSha();

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/README.md`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'Update README.md',
        content: Buffer.from(newContent).toString('base64'),
        sha,
      }),
    }
  );

  if (response.ok) {
    console.log('README.md updated successfully!');
  } else {
    const errorResponse = await response.json();
    console.error(
      'Error updating README.md:',
      response.statusText,
      errorResponse
    );
  }
}

async function getReadmeSha() {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/README.md`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  const data = await response.json();

  if (response.ok && data.sha) {
    return data.sha;
  } else {
    throw new Error('Unable to retrieve README.md SHA.');
  }
}

updateReadme();
