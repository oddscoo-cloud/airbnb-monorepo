using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("profile_facts")]
public class ProfileFacts
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public required int UserId { get; set; }

    [Column("education")]
    public string? Education { get; set; }

    [Column("profession")]
    public string? Profession { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("languages")]
    public string? Languages { get; set; }
    
    [Column("birthday_decade")]
    public string? BirthdayDecade { get; set; }

    [Column("song")]
    public string? Song { get; set; }

    [Column("excitement")]
    public string? Excitement { get; set; }

    [Column("fact")]
    public string? Fact { get; set; }

    [Column("useless_skills")]
    public string? UselessSkills { get; set; }

    [Column("biography_title")]
    public string? BiographyTitle { get; set; }

    [Column("time_absorber")]
    public string? TimeAbsorber { get; set; }

    [Column("pets")]
    public string? Pets { get; set; }

    [Column("about_me")]
    public string? AboutMe { get; set; }

    [Column("favorite")]
    public string? Favorite { get; set; }




    [ForeignKey("UserId")]
    public User? User { get; set; }
}
