import { useCallback, useContext, useEffect, useState } from 'react'
import { FrappeContext, type FrappeConfig, useFrappeGetCall } from 'frappe-react-sdk'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import _ from '@lib/translate'

type Provider = { id: string; name: string }
type Entry = { title: string; subline: string; url: string; thumbnail: string }
type SearchResult = { entries: Entry[]; cursor: number | null }

export const NEXTCLOUD_REFERENCE_DOCTYPE = 'Nextcloud Reference'

interface NextcloudPickerProps {
    /** Called with the name of the Nextcloud Reference to stage on the message. */
    onPick: (docname: string) => void
}

/**
 * Pick any Nextcloud object, or paste its link. The COMPASS app compass_sso asks
 * Nextcloud with the signed-in user's token, so Nextcloud decides what shows up.
 * Lists the providers Nextcloud offers instead of a fixed set of apps.
 */
const NextcloudPicker = ({ onPick }: NextcloudPickerProps) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const { data: providerData, error: providerError, isLoading: providersLoading } = useFrappeGetCall<{ message: Provider[] }>(
        'compass_sso.nextcloud.providers', undefined, 'nextcloud_providers', { shouldRetryOnError: false },
    )
    const providers = providerData?.message ?? []

    const [pickedProviderID, setProviderID] = useState('')
    const providerID = pickedProviderID || providers[0]?.id || ''
    const [term, setTerm] = useState('')
    const [entries, setEntries] = useState<Entry[]>([])
    const [cursor, setCursor] = useState<number | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [message, setMessage] = useState('')


    const isLink = /^https?:\/\//i.test(term.trim())

    const fail = (error: { message?: string; exception?: string }) =>
        setMessage(error?.message || _('Nextcloud is not reachable.'))

    const runSearch = useCallback((nextCursor: number | null) => {
        if (!providerID) return
        setIsSearching(true)
        setMessage('')
        call.get('compass_sso.nextcloud.search', { provider: providerID, term, ...(nextCursor ? { cursor: nextCursor } : {}) })
            .then((response: { message: SearchResult }) => {
                setEntries((previous) => (nextCursor ? [...previous, ...response.message.entries] : response.message.entries))
                setCursor(response.message.cursor)
            })
            .catch(fail)
            .finally(() => setIsSearching(false))
    }, [call, providerID, term])

    // Search while typing, unless the field holds a link: that one is resolved on request.
    useEffect(() => {
        if (isLink) return
        const timer = setTimeout(() => runSearch(null), 300)
        return () => clearTimeout(timer)
    }, [runSearch, isLink])

    const pick = (entry?: Entry) => {
        setMessage('')
        call.post('compass_sso.nextcloud.reference', entry ? { url: entry.url, title: entry.title, subline: entry.subline, thumbnail: entry.thumbnail } : { url: term.trim() })
            .then((response: { message: string }) => onPick(response.message))
            .catch(fail)
    }

    if (providersLoading) return <div className="flex h-24 items-center justify-center"><Spinner /></div>
    if (providerError || !providers.length) {
        return <p className="text-p-sm text-ink-gray-6">{_('Nextcloud is not reachable.')}</p>
    }

    return (
        <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap gap-1">
                {providers.map((provider) => (
                    <Button key={provider.id} type="button" size="sm" variant={provider.id === providerID ? 'subtle' : 'ghost'} onClick={() => setProviderID(provider.id)}>
                        {provider.name}
                    </Button>
                ))}
            </div>
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder={_('Search, or paste a Nextcloud link')} aria-label={_('Search Nextcloud')} />
            {message && <p role="alert" className="text-p-sm text-ink-red-4">{message}</p>}
            {isLink ? (
                <Button type="button" onClick={() => pick()}>{_('Attach this link')}</Button>
            ) : (
                <ul className="flex max-h-64 flex-col overflow-y-auto">
                    {entries.map((entry) => (
                        <li key={entry.url}>
                            <button type="button" className="flex w-full min-w-0 flex-col rounded px-2 py-1.5 text-left hover:bg-surface-gray-2" onClick={() => pick(entry)}>
                                <span className="truncate text-base text-ink-gray-8">{entry.title}</span>
                                {entry.subline && <span className="truncate text-p-xs text-ink-gray-5">{entry.subline}</span>}
                            </button>
                        </li>
                    ))}
                    {!isSearching && !entries.length && <li className="px-2 py-3 text-p-sm text-ink-gray-5">{_('No results found.')}</li>}
                    {cursor && <li><Button type="button" variant="ghost" size="sm" disabled={isSearching} onClick={() => runSearch(cursor)}>{_('Load more')}</Button></li>}
                </ul>
            )}
        </div>
    )
}

export default NextcloudPicker
