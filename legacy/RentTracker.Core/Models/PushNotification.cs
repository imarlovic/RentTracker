using System;

namespace RentTracker.Core.Models
{
    public class PushNotification
    {
        public NotificationType NotificationType { get; set; }
        public Guid? ApartmentId { get; set; }
        public Guid? UserId { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }

        public PushNotification(NotificationType notificationType)
        {
            NotificationType = notificationType;
        }
    }

    public enum NotificationType
    {
        NewReservation = 0,
        Cancellation = 1
    }
}
