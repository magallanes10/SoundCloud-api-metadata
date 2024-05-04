const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { SoundCloud } = require('scdl-core');

const app = express();
const port = 3000;

app.get('/sc', async (req, res) => {
  try {
    const search = req.query.search;
    const axiosResponse = await axios.get(`https://soundcloud-hshs.onrender.com/sc?query=${search}`);
    const firstUrl = axiosResponse.data[0].url;

    const permalink = firstUrl;
    const streamOptions = {
      highWaterMark: 1 << 25 // 32Mb, default is 16kb
    };

    await SoundCloud.connect();
    const stream = await SoundCloud.download(permalink, streamOptions);

    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);

    // Delete the file after 5 minutes
    setTimeout(() => {
      stream.destroy();
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error('Error downloading the audio:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
