export const scrollContainers = () => {
    try {
        document.getElementById('stage-parent')?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) { }
}
