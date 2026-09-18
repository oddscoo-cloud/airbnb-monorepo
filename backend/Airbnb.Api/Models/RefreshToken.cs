using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("refresh_tokens")]
public class RefreshToken
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public required int UserId { get; set; }

    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    [Column("is_revoked")]
    public required bool IsRevoked { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }




    [ForeignKey("UserId")]
    public User? User { get; set; }
}