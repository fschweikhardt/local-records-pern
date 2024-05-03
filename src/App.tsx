import { useState, useEffect } from 'react'
import './App.css'

interface Record {
  id: number;
  release: {
    artist: string;
    title: string;
    format: string;
    images: { resource_url: string }[];
  };
  price: {
    value: string;
  };
}

function App() {
    const [ loaded, setLoaded ] = useState(false)
    const [ records, setRecords ] = useState<Record[]>([])
    const [ counter, setCounter ] = useState(0)
    const [ flipMode, setFlipMode ] = useState(true)
    const [ menuDisplay, setMenuDisplay ] = useState(false)
    
    useEffect(()=> {
        const getRandomPage = Math.floor(Math.random() * 39)
        const pageination = `page=${getRandomPage}&per_page=100`
        const token = `token=${import.meta.env.VITE_DISCOGS_API_KEY}`
        const url = `https://api.discogs.com/users/landlockedmusic/inventory?${pageination}&${token}`
        const options = {
          method: 'GET',
          headers: {
              'User-Agent': 'LocalRecordStoreApp/1.0 localhost'
          }
      };
        let resFiltered = []
        fetch(url, options)
            .then(res => res.json())
            .then(res => {
                resFiltered = res.listings.filter( (listing:any) => 
                    listing.release.artist &&
                    listing.release.title &&
                    listing.release.description &&
                    listing.release.format &&
                    listing.price.value &&
                    listing.release.thumbnail && 
                    listing.release.images[0].resource_url && 
                    !listing.release.format.match(/CD/) &&
                    !listing.release.format.match(/Cass/)
                )
                setRecords(resFiltered)
                setLoaded(true)
            })
    }, [])

    const handleDisplayFavorites = async () => {
        console.log('display favorites')
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        try {
            const response = await fetch('http://localhost:8000/api/displayFavorites', options)
            const data = await response.json()
            console.log(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddToFavorites = async () => {
        const options = {
            method: 'POST',
            body: JSON.stringify({
                item_id: records[counter].id
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }
        try {
            const response = await fetch('http://localhost:8000/api/addToFavorites', options)
            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }

    const handleAuthorize = async () => {
        console.log('authorize')
        const options = {
            method: 'GET',
            headers: {
                'Allow-Control-Allow-Origin': '*',
            }
        }
        try {
            const response = await fetch('http://localhost:8000/api/authorize', options)
            console.log(response)
            window.location.href = response.url
        } catch (error) {
            console.error(error)
        }
    }
    
    if (!loaded) { 
      return <></>
  } else {
        console.log(records[counter])
        return (
          <>
              {!menuDisplay && 
                  <div>
                      <header>
                          <h1>Landlocked Music</h1>
                          <h3>Bloomington Indiana</h3>  
                      </header>
                      <main>
                          <button onClick={()=>setFlipMode(!flipMode)}>
                              flip mode is {flipMode ? 'on' : 'off'}
                          </button>
                          <br />
                          <br />
                          <div>
                              { !flipMode &&
                                  <div
                                      className='flex flex-col items-center gap-2 border-4 border-solid border-black p-2.5'
                                  >
                                      <h1 className='text-xl'>{records[counter].release.artist}</h1>
                                      <img 
                                          src={records[counter].release.images[0].resource_url} 
                                          alt={records[counter].release.artist}
                                          width={window.innerWidth/1.5}
                                          height={window.innerWidth/1.5}
                                      />
                                      <h2>{records[counter].release.title}</h2>
                                      <h3>{records[counter].release.format}</h3>
                                      <h3>${records[counter].price.value}</h3>
                                  </div>
                              }
                              { flipMode && 
                                  <img 
                                      src={records[counter].release.images[0].resource_url} 
                                      alt={records[counter].release.artist}
                                      width={window.innerWidth - 20}
                                      height={window.innerWidth - 20}
                                  />
                              }
                                  <div
                                      className='pt-8'
                                  >
                                      <button 
                                          onClick={counter === 0 ? ()=>{} : ()=>setCounter(counter-1)}
                                      >
                                          prev
                                      </button>
                                      <button 
                                          onClick={()=>{ handleAddToFavorites() }}
                                          className='px-2.5'
                                      >
                                          add to favorite
                                      </button>
                                      <button 
                                          onClick={counter === records.length-1 ? ()=>window.location.reload() : ()=>setCounter(counter+1)}
                                      >
                                          next
                                      </button>
                                        <button 
                                          onClick={()=>{ handleDisplayFavorites() }}
                                          className='px-2.5'
                                      >
                                          display favorites
                                      </button>
                                      <button 
                                          onClick={()=>{ handleAuthorize() }}
                                          className='px-2.5'
                                      >
                                          authorize
                                      </button>
                                  </div>
                          </div>
                      </main>
                  </div>
              }
              <div>
                  <button 
                      className='absolute top-7 right-7 p-1'
                      onClick={()=>setMenuDisplay(!menuDisplay)}
                  >
                      options
                  </button>
                  {menuDisplay && 
                      <button 
                          className='ml-5'
                          onClick={()=>window.location.reload()}
                      >
                          shuffle
                      </button>   
                  }
              </div>
          </>
      )
  }
}

export default App
