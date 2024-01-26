import Plus from '@/components/icons/Plus'
import Trash from '@/components/icons/Trash'
import EditableImage from '@/components/layout/EditableImage'
import MenuItemPriceProps from '@/components/layout/MenuItemPriceProps'
import { useEffect, useState } from 'react'

export default function MenuItemForm ({ onSubmit, menuItem }) {
  const [image, setImage] = useState(menuItem?.image || '')
  const [name, setName] = useState(menuItem?.name || '')
  const [description, setDescription] = useState(menuItem?.description || '')
  const [basePrice, setBasePrice] = useState(menuItem?.basePrice || '')
  const [sizes, setSizes] = useState(menuItem?.sizes || [])
  const [category, setCategory] = useState(menuItem?.category || '')
  const [categories, setCategories] = useState([])
  const [extraIngredientPrices, setExtraIngredientPrices] = useState(
    menuItem?.extraIngredientPrices || []
  )

  useEffect(() => {
    fetch('/api/categories').then(res => {
      res.json().then(categories => {
        setCategories(categories)
      })
    })
  }, [])

  async function handleFileChange (ev) {
    const files = ev.target.files
    if (files?.length === 1) {
      const files = ev.target.files
      const url = 'http://api.cloudinary.com/v1_1/djo2k58eq/image/upload'

      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('upload_preset', 'new-data')

      const uploadPromise = await fetch(url, {
        method: 'POST',
        body: formData
      }).then(r => r.json().then())

      setImage(uploadPromise.secure_url)

      await toast.promise(uploadPromise, {
        loading: 'Uploading...',
        success: 'Upload complete',
        error: 'Upload error'
      })
    }
  }

  return (
    <form
      onSubmit={ev =>
        onSubmit(ev, {
          image,
          name,
          description,
          basePrice,
          sizes,
          extraIngredientPrices,
          category
        })
      }
      className='mt-8 max-w-2xl mx-auto'
    >
      <div
        className='md:grid items-start gap-4'
        style={{ gridTemplateColumns: '.3fr .7fr' }}
      >
        <div>
          <EditableImage link={image} setLink={setImage} />
        </div>
        <div className='grow'>
          <label>Item name</label>
          <input type='text' value={name} onChange={(ev)=> setName(ev.target.value)} />
          <label>Description</label>
          <input
            type='text'
            value={description}
            onChange={ev => setDescription(ev.target.value)}
          />
          <label>Category</label>
          <select
            value={category}
            onChange={ev => {setCategory(ev.target.value);console.log(ev.target.value)}}
          >
            {categories?.length > 0 &&
              categories.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
              <option key={"n"} value={"34555"}>
                  {"Nulla"}
                </option>
          </select>
          <label>Base price</label>
          <input
            type='text'
            value={basePrice}
            onChange={ev => setBasePrice(ev.target.value)}
          />
          <MenuItemPriceProps
            name={'Sizes'}
            addLabel={'Add item size'}
            props={sizes}
            setProps={setSizes}
          />
          <MenuItemPriceProps
            name={'Extra ingredients'}
            addLabel={'Add ingredients prices'}
            props={extraIngredientPrices}
            setProps={setExtraIngredientPrices}
          />
          <button type='submit'>Save</button>
        </div>
      </div>
    </form>
  )
}
