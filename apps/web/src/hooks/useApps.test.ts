import { describe, expect, it } from "vitest"
import { appsFrom } from "./useApps"

describe("appsFrom", () => {
    it("returns the apps of the response", () => {
        const apps = [{ name: "crm", logo: "/crm.svg", title: "CRM", route: "/crm" }]
        expect(appsFrom({ message: apps })).toEqual(apps)
    })

    it("returns no apps while the list is loading or failed", () => {
        expect(appsFrom(undefined)).toEqual([])
        expect(appsFrom({})).toEqual([])
    })
})
