'use client'

import { FormEvent, useState } from 'react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      // Replace with your Formspree endpoint when available.
      await fetch('https://formspree.io/f/xblyqjwp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-cyan/25 bg-navy/50 p-6 backdrop-blur-md">
      <h1 className="text-3xl font-semibold">Contact Control Tower</h1>
      <p className="text-sm text-white/75">Tell us what process you want to improve and we will map your first automation opportunities.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-white/75">Name</span>
          <input required name="name" className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 outline-none focus:border-cyan" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-white/75">Company</span>
          <input required name="company" className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 outline-none focus:border-cyan" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-white/75">Email</span>
        <input required type="email" name="email" className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 outline-none focus:border-cyan" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-white/75">Message</span>
        <textarea required name="message" rows={6} className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 outline-none focus:border-cyan" />
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded border border-cyan/40 bg-cyan/10 px-4 py-2 font-mono text-xs tracking-[0.2em] text-cyan disabled:opacity-50"
      >
        {status === 'submitting' ? 'SENDING...' : 'SUBMIT'}
      </button>

      {status === 'success' && <p className="text-sm text-green">Thanks, we will get back to you soon.</p>}
      {status === 'error' && <p className="text-sm text-amber">Something went wrong. Please try again.</p>}
    </form>
  )
}
