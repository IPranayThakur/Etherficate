import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)

  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider)
    setNFT(nft)
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (name === "" || description === "") {
      window.alert("Please provide a name and description")
      return
    }

    setIsWaiting(true)

    // Call AI API to generate a image based on description
    const imageData = await createImage()

    // Upload image to IPFS (NFT.Storage)
    // const url = await uploadImage(imageData)

    // Mint NFT
    // await mintImage(url)

    setIsWaiting(false)
    setMessage("")
  }

  const createImage = async () => {
    setMessage("Generating Image...")
//Stable diffusion section - > replace with child python process
    // You can replace this with different model API's
    //const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`

    // Send the request to stable diffusion
    // const response = await axios({
    //   url: URL,
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   data: JSON.stringify({
    //     inputs: description, options: { wait_for_model: true },
    //   }),
    //   responseType: 'arraybuffer',
    // })

    // const type = response.headers['content-type']
    // const data = response.data



const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const image = new Image();
image.src = "/Users/atmajkoppikar/Desktop/ai_nft_generator/Certificate_template.png";

image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Add text to the canvas
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Pranav Bhide', 630, 430);
    ctx.fillText('0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', 930, 515);
    ctx.fillText('Mid Journey Prompting', 970, 660);
    ctx.fillText('Sakshi Surve ', 970, 800);
    ctx.fillStyle = 'white';
    ctx.fillText('6969', 85, 1105);
};

    const data = "pretty image"
    const base64data = Buffer.from(image).toString('base64')
    const img = `data:png;base64,` + base64data // <-- This is so we can render it on the page
    setImage(img)

    return data
  }

  const uploadImage = async (imageData) => {
    setMessage("Uploading Image...")

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })

    // Save the URL
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)

    return url
  }

  const mintImage = async (tokenURI) => {
    setMessage("Waiting for Mint...")

    const signer = await provider.getSigner()
    const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("1", "ether") })
    await transaction.wait()
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className='form'>
        <form onSubmit={submitHandler}>
          <input type="text" placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
          <input type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
          <input type="submit" value="Create & Mint" />
        </form>

        <div className="image">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {!isWaiting && url && (
        <p>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
    </div>
  );
}

export default App;