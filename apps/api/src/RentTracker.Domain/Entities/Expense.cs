namespace RentTracker.Domain.Entities;

public class Expense : Entity
{
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public Currency Currency { get; set; } = Currency.EUR;
}
