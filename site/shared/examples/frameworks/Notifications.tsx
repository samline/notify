import { useEffect } from 'react'
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

// Mount once at the application root, not once per route or button.
export function Notifications() {
  useEffect(() => {
    createToaster({ richColors: true, closeButton: true })
    return () => destroyToaster()
  }, [])
  return (
    <button type="button" onClick={() => toast.success('Changes saved')}>
      Save changes
    </button>
  )
}
