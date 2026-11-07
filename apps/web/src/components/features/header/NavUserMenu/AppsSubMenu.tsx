import { LayoutGrid } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@components/ui/dropdown-menu"
import { useApps } from "@hooks/useApps"
import _ from "@lib/translate"

/** The window name makes a second click reuse the window; `noopener` would ignore the name, and an opener cut after opening the address does not hold. So the empty window opens first, loses its opener, and only then gets the address. */
const openApp = (app: { name: string; route: string }) => {
    const target = window.open("", `compass-${app.name}`)
    if (!target) return
    try {
        target.opener = null
    } catch (e) {
        // a reused window of another host has the opener cut already
    }
    target.location.href = app.route
}

/** Switch to the other apps of the site, each in its own window, like the apps menu of Helpdesk and CRM. */
const AppsSubMenu = () => {
    const apps = useApps()

    if (apps.length === 0) return null

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <LayoutGrid />
                <span>{_("Apps")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {apps.map((app) => (
                    <DropdownMenuItem key={app.name} onClick={() => openApp(app)}>
                        <img src={app.logo} alt="" className="size-4 rounded-sm" />
                        <span>{app.title}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}

export default AppsSubMenu
