import { useFrappeGetCall } from "frappe-react-sdk"

export interface FrappeApp {
    name: string
    logo: string
    title: string
    route: string
}

/** Apps of the site the user may open, the same list as the app overview of Frappe. */
export const appsFrom = (response?: { message?: FrappeApp[] }): FrappeApp[] => response?.message ?? []

export function useApps(): FrappeApp[] {
    // The list is the same for the whole session, so it is not refetched on focus.
    const { data } = useFrappeGetCall<{ message: FrappeApp[] }>("frappe.apps.get_apps", undefined, "frappe.apps.get_apps", {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    return appsFrom(data)
}
