describe('API tests', function () {
    it("Use is def", function () {
        expect(crudURL).toBeDefined();
        expect(crudURL).toEqual("Test1");
    });
});