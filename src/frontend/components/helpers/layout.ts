import { uid } from "uid"
import { clone } from "./array"
import { _show } from "./shows"
import type { Slide, SlideData } from "../../../types/Show"

export function getCurrentLayout() {
    const slides: { [key: string]: Slide } = clone(_show().get().slides)
    const layout: SlideData[] = _show().layouts("active").get()[0].slides
    return clone({ slides, layout })
}

export function cloneSlide(currentLayout: { slides: { [key: string]: Slide }; layout: SlideData[] }, oldSlideId: string, newSlideId: string, keepChildren = true) {
    const newSlide = clone(currentLayout.slides[oldSlideId])

    // cloning a parent means that all its children must be cloned too
    if (newSlide.children) {
        if (keepChildren) {
            // clone children
            const clonedChildren: string[] = []
            newSlide.children.forEach((childId: string) => {
                const newChild = clone(currentLayout.slides[childId])
                const newChildId: string = uid()
                currentLayout.slides[newChildId] = newChild
                clonedChildren.push(newChildId)
            })
            newSlide.children = clonedChildren
        } else delete newSlide.children
    }

    currentLayout.slides[newSlideId] = newSlide

    return currentLayout
}

export function addParents(currentLayout: { slides: { [key: string]: Slide }; layout: SlideData[] }, parents: { id: string; data: SlideData; pos: number }[]) {
    parents
        .sort((a, b) => (a.pos < b.pos ? 1 : -1))
        .forEach(({ id, data, pos }) => {
            currentLayout.layout = [...currentLayout.layout.slice(0, pos), { ...data, id }, ...currentLayout.layout.slice(pos, currentLayout.layout.length)]
        })
    return currentLayout
}
